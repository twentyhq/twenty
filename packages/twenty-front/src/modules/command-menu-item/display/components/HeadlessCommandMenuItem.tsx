import { type ReactNode, useContext, useId } from 'react';

import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { useMountCommand } from '@/command-menu-item/engine-command/hooks/useMountCommand';
import { useCommandMenuContextApi } from '@/command-menu-item/server-items/common/hooks/useCommandMenuContextApi';
import { isEngineCommandMountedFamilySelector } from '@/command-menu-item/engine-command/selectors/isEngineCommandMountedFamilySelector';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAICElement } from '@aicorg/sdk-react';
import { isDefined } from 'twenty-shared/utils';
import {
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

import { CommandMenuItemDisplay } from './CommandMenuItemDisplay';

export const HeadlessCommandMenuItem = ({
  item,
}: {
  item: CommandMenuItemFieldsFragment;
}) => {
  const commandMenuItemConfig = useContext(CommandConfigContext);
  const mountCommand = useMountCommand();

  const contextStoreInstanceId = useAvailableComponentInstanceIdOrThrow(
    ContextStoreComponentInstanceContext,
  );

  const isMounted = useAtomFamilySelectorValue(
    isEngineCommandMountedFamilySelector,
    item.id,
  );

  const { closeCommandMenu } = useCloseCommandMenu({
    closeSidePanelOnShowPageOptionsExecution: false,
    closeSidePanelOnCommandMenuListExecution: false,
  });

  const commandMenuItemProgress = useAtomFamilyStateValue(
    commandMenuItemProgressFamilyState,
    item.id,
  );

  if (!isDefined(commandMenuItemConfig)) {
    return null;
  }

  const handleClick = async () => {
    if (isMounted) {
      return;
    }

    closeCommandMenu();

    await mountCommand({
      engineCommandId: item.id,
      contextStoreInstanceId,
      engineComponentKey: item.engineComponentKey,
      frontComponentId: item.frontComponentId ?? undefined,
      workflowVersionId: item.workflowVersionId ?? undefined,
      availabilityType: item.availabilityType,
      availabilityObjectMetadataId: item.availabilityObjectMetadataId,
    });
  };

  return (
    <AICCommandMenuItemWrapper item={item}>
      <CommandMenuItemDisplay
        onClick={handleClick}
        disabled={isMounted}
        progress={commandMenuItemProgress}
        showDisabledLoader={isMounted}
      />
    </AICCommandMenuItemWrapper>
  );
};

const AICCommandMenuItemWrapper = ({
  item,
  children,
}: {
  item: CommandMenuItemFieldsFragment;
  children: ReactNode;
}) => {
  const action = useContext(CommandConfigContext);
  const commandMenuContextApi = useCommandMenuContextApi();
  const instanceKey = normalizeAgentKeyFragment(useId());

  if (!isDefined(action)) {
    return children;
  }

  const metadata = buildCommandMenuAICMetadata(
    item,
    action,
    commandMenuContextApi,
    instanceKey,
  );

  if (!metadata) {
    return children;
  }

  const { attributes } = useAICElement(metadata, {
    defaultAction: 'click',
    role: 'menuitem',
  });

  return <div {...attributes}>{children}</div>;
};

function buildCommandMenuAICMetadata(
  item: CommandMenuItemFieldsFragment,
  action: { key?: unknown; label: unknown; description?: unknown },
  commandMenuContextApi: ReturnType<typeof useCommandMenuContextApi>,
  instanceKey: string,
) {
  const label = getCommandMenuItemLabel(action.label);
  const description = getCommandMenuItemLabel(action.description);
  const actionKey = normalizeAgentKeyFragment(action.key);
  const selectedRecord = commandMenuContextApi.selectedRecords.at(0);
  const objectMetadataItem = commandMenuContextApi.objectMetadataItem;
  const objectNameSingular = objectMetadataItem.nameSingular ?? 'record';
  const objectLabelSingular = objectMetadataItem.labelSingular ?? 'record';
  const objectLabelPlural = objectMetadataItem.labelPlural ?? 'records';
  const isSingleRecord = commandMenuContextApi.numberOfSelectedRecords === 1;
  const entityId =
    selectedRecord?.id ??
    (isSingleRecord ? 'selected_record' : 'record_selection');
  const entityLabel =
    selectedRecord?.name ??
    (isSingleRecord ? objectLabelSingular : objectLabelPlural);

  switch (item.engineComponentKey) {
    case EngineComponentKey.DELETE_RECORDS:
    case EngineComponentKey.DELETE_SINGLE_RECORD:
    case EngineComponentKey.DELETE_MULTIPLE_RECORDS:
      return {
        agentAction: 'click' as const,
        agentDescription:
          description ||
          'Soft delete the selected record and expose restore and permanent-destroy follow-up actions. This step is reversible.',
        agentEntityId: entityId,
        agentEntityLabel: entityLabel,
        agentEntityType: objectNameSingular,
        agentExecution: {
          settled_when: [
            'Deleted record banner is visible and restore or destroy follow-up actions are available.',
          ],
        },
        agentId: `command_menu.record.soft_delete.${item.id}.${actionKey}.${instanceKey}`,
        agentLabel: label || 'Delete record',
        agentRecovery: {
          partial_state_changed: true,
          recovery:
            'Use the restore action to recover the soft-deleted record.',
          retryable: false,
        },
        agentRisk: 'high' as const,
        agentWorkflowStep: 'record.soft_delete',
      };
    case EngineComponentKey.DESTROY_RECORDS:
    case EngineComponentKey.DESTROY_SINGLE_RECORD:
    case EngineComponentKey.DESTROY_MULTIPLE_RECORDS:
      return {
        agentAction: 'click' as const,
        agentConfirmation: {
          prompt_template:
            'Open the irreversible destroy confirmation dialog for the selected record. Do not confirm unless explicit approval was given.',
          summary_fields: ['entity_label', 'entity_id'],
          type: 'inline_modal' as const,
        },
        agentDescription:
          description ||
          'Open the irreversible destroy action for the current record. This leads to a critical confirmation boundary.',
        agentEntityId: entityId,
        agentEntityLabel: entityLabel,
        agentEntityType: objectNameSingular,
        agentId: `command_menu.record.destroy.${item.id}.${actionKey}.${instanceKey}`,
        agentLabel: label || 'Permanently destroy record',
        agentRequiresConfirmation: true,
        agentRisk: 'critical' as const,
        agentWorkflowStep: 'record.open_destroy_confirmation',
      };
    case EngineComponentKey.RESTORE_RECORDS:
    case EngineComponentKey.RESTORE_SINGLE_RECORD:
    case EngineComponentKey.RESTORE_MULTIPLE_RECORDS:
      return {
        agentAction: 'click' as const,
        agentDescription:
          description || 'Restore the selected soft-deleted record to the active state.',
        agentEntityId: entityId,
        agentEntityLabel: entityLabel,
        agentEntityType: objectNameSingular,
        agentId: `command_menu.record.restore.${item.id}.${actionKey}.${instanceKey}`,
        agentLabel: label || 'Restore record',
        agentRisk: 'low' as const,
        agentWorkflowStep: 'record.restore',
      };
    default:
      return null;
  }
}

function normalizeAgentKeyFragment(value: unknown) {
  return String(value ?? 'command')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '_');
}
