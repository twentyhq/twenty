import { useRunWorkflowRecordAgnosticActions } from '@/action-menu/actions/record-agnostic-actions/run-workflow-actions/hooks/useRunWorkflowRecordAgnosticActions';
import {
  CommandMenuItemContext,
  type CommandMenuItemContextType,
} from '@/action-menu/contexts/CommandMenuItemContext';
import { useRegisteredActions } from '@/action-menu/hooks/useRegisteredActions';
import { useShouldActionBeRegisteredParams } from '@/action-menu/hooks/useShouldActionBeRegisteredParams';
import { useCommandMenuItemContextApi } from '@/action-menu/hooks/useCommandMenuItemContextApi';
import { useCommandMenuItemFrontComponentActions } from '@/command-menu-item/hooks/useCommandMenuItemFrontComponentActions';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

type CommandMenuItemContextProviderWorkflowObjectsProps = {
  objectMetadataItem: ObjectMetadataItem;
  isInSidePanel: CommandMenuItemContextType['isInSidePanel'];
  displayType: CommandMenuItemContextType['displayType'];
  actionMenuType: CommandMenuItemContextType['actionMenuType'];
  children: React.ReactNode;
};

const CommandMenuItemContextProviderWorkflowObjectsContent = ({
  objectMetadataItem,
  isInSidePanel,
  displayType,
  actionMenuType,
  children,
  selectedRecordId,
}: CommandMenuItemContextProviderWorkflowObjectsProps & {
  selectedRecordId: string;
}) => {
  const params = useShouldActionBeRegisteredParams({
    objectMetadataItem,
  });

  const workflowWithCurrentVersion =
    useWorkflowWithCurrentVersion(selectedRecordId);

  const shouldBeRegisteredParams = {
    ...params,
    workflowWithCurrentVersion,
  };

  const actions = useRegisteredActions(shouldBeRegisteredParams);

  const runWorkflowRecordAgnosticActions =
    useRunWorkflowRecordAgnosticActions();

  const commandMenuItemContextApi = useCommandMenuItemContextApi();

  const commandMenuItemFrontComponentActions =
    useCommandMenuItemFrontComponentActions(commandMenuItemContextApi);

  return (
    <CommandMenuItemContext.Provider
      value={{
        isInSidePanel,
        displayType,
        actionMenuType,
        actions: [
          ...actions,
          ...runWorkflowRecordAgnosticActions,
          ...commandMenuItemFrontComponentActions,
        ],
      }}
    >
      {children}
    </CommandMenuItemContext.Provider>
  );
};

const CommandMenuItemContextProviderWorkflowObjectsWithoutWorkflow = ({
  objectMetadataItem,
  isInSidePanel,
  displayType,
  actionMenuType,
  children,
}: CommandMenuItemContextProviderWorkflowObjectsProps & {
  workflowWithCurrentVersion: WorkflowWithCurrentVersion | undefined;
}) => {
  const params = useShouldActionBeRegisteredParams({
    objectMetadataItem,
  });

  const shouldBeRegisteredParams = {
    ...params,
    workflowWithCurrentVersion: undefined,
  };

  const actions = useRegisteredActions(shouldBeRegisteredParams);

  const runWorkflowRecordAgnosticActions =
    useRunWorkflowRecordAgnosticActions();

  const commandMenuItemContextApi = useCommandMenuItemContextApi();

  const commandMenuItemFrontComponentActions =
    useCommandMenuItemFrontComponentActions(commandMenuItemContextApi);

  return (
    <CommandMenuItemContext.Provider
      value={{
        isInSidePanel,
        displayType,
        actionMenuType,
        actions: [
          ...actions,
          ...runWorkflowRecordAgnosticActions,
          ...commandMenuItemFrontComponentActions,
        ],
      }}
    >
      {children}
    </CommandMenuItemContext.Provider>
  );
};

export const CommandMenuItemContextProviderWorkflowObjects = ({
  objectMetadataItem,
  isInSidePanel,
  displayType,
  actionMenuType,
  children,
}: CommandMenuItemContextProviderWorkflowObjectsProps) => {
  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const recordId =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 1
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const selectedRecord =
    useAtomFamilyStateValue(recordStoreFamilyState, recordId ?? '') ||
    undefined;

  if (isDefined(selectedRecord?.id)) {
    return (
      <CommandMenuItemContextProviderWorkflowObjectsContent
        objectMetadataItem={objectMetadataItem}
        isInSidePanel={isInSidePanel}
        displayType={displayType}
        actionMenuType={actionMenuType}
        selectedRecordId={selectedRecord.id}
      >
        {children}
      </CommandMenuItemContextProviderWorkflowObjectsContent>
    );
  }

  return (
    <CommandMenuItemContextProviderWorkflowObjectsWithoutWorkflow
      objectMetadataItem={objectMetadataItem}
      isInSidePanel={isInSidePanel}
      displayType={displayType}
      actionMenuType={actionMenuType}
      workflowWithCurrentVersion={undefined}
    >
      {children}
    </CommandMenuItemContextProviderWorkflowObjectsWithoutWorkflow>
  );
};
