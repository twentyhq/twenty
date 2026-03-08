import { useRunWorkflowRecordAgnosticCommands } from '@/command-menu-item/record-agnostic/workflow/hooks/useRunWorkflowRecordAgnosticCommands';
import {
  CommandMenuItemContext,
  type CommandMenuItemContextType,
} from '@/command-menu-item/contexts/CommandMenuItemContext';
import { useRegisteredCommandMenuItems } from '@/command-menu-item/hooks/useRegisteredCommandMenuItems';
import { useShouldCommandMenuItemBeRegisteredParams } from '@/command-menu-item/hooks/useShouldCommandMenuItemBeRegisteredParams';
import { useCommandMenuItemContextApi } from '@/command-menu-item/hooks/useCommandMenuItemContextApi';
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
  containerType: CommandMenuItemContextType['containerType'];
  children: React.ReactNode;
};

const CommandMenuItemContextProviderWorkflowObjectsContent = ({
  objectMetadataItem,
  isInSidePanel,
  displayType,
  containerType,
  children,
  selectedRecordId,
}: CommandMenuItemContextProviderWorkflowObjectsProps & {
  selectedRecordId: string;
}) => {
  const params = useShouldCommandMenuItemBeRegisteredParams({
    objectMetadataItem,
  });

  const workflowWithCurrentVersion =
    useWorkflowWithCurrentVersion(selectedRecordId);

  const shouldBeRegisteredParams = {
    ...params,
    workflowWithCurrentVersion,
  };

  const actions = useRegisteredCommandMenuItems(shouldBeRegisteredParams);

  const runWorkflowRecordAgnosticActions =
    useRunWorkflowRecordAgnosticCommands();

  const commandMenuItemContextApi = useCommandMenuItemContextApi();

  const commandMenuItemFrontComponentActions =
    useCommandMenuItemFrontComponentActions(commandMenuItemContextApi);

  return (
    <CommandMenuItemContext.Provider
      value={{
        isInSidePanel,
        displayType,
        containerType,
        commandMenuItems: [
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
  containerType,
  children,
}: CommandMenuItemContextProviderWorkflowObjectsProps & {
  workflowWithCurrentVersion: WorkflowWithCurrentVersion | undefined;
}) => {
  const params = useShouldCommandMenuItemBeRegisteredParams({
    objectMetadataItem,
  });

  const shouldBeRegisteredParams = {
    ...params,
    workflowWithCurrentVersion: undefined,
  };

  const actions = useRegisteredCommandMenuItems(shouldBeRegisteredParams);

  const runWorkflowRecordAgnosticActions =
    useRunWorkflowRecordAgnosticCommands();

  const commandMenuItemContextApi = useCommandMenuItemContextApi();

  const commandMenuItemFrontComponentActions =
    useCommandMenuItemFrontComponentActions(commandMenuItemContextApi);

  return (
    <CommandMenuItemContext.Provider
      value={{
        isInSidePanel,
        displayType,
        containerType,
        commandMenuItems: [
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
  containerType,
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
        containerType={containerType}
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
      containerType={containerType}
      workflowWithCurrentVersion={undefined}
    >
      {children}
    </CommandMenuItemContextProviderWorkflowObjectsWithoutWorkflow>
  );
};
