import { useRunWorkflowRecordAgnosticCommands } from '@/command-menu-item/record-agnostic/workflow/hooks/useRunWorkflowRecordAgnosticCommands';
import {
  CommandMenuContext,
  type CommandMenuContextType,
} from '@/command-menu-item/contexts/CommandMenuContext';
import { useRegisteredCommandMenuItems } from '@/command-menu-item/hooks/useRegisteredCommandMenuItems';
import { useShouldCommandMenuItemBeRegisteredParams } from '@/command-menu-item/hooks/useShouldCommandMenuItemBeRegisteredParams';
import { useCommandMenuContextApi } from '@/command-menu-item/hooks/useCommandMenuContextApi';
import { useCommandMenuItemFrontComponentActions } from '@/command-menu-item/hooks/useCommandMenuItemFrontComponentActions';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

type CommandMenuContextProviderWorkflowObjectsProps = {
  objectMetadataItem: ObjectMetadataItem;
  isInSidePanel: CommandMenuContextType['isInSidePanel'];
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
};

const CommandMenuContextProviderWorkflowObjectsContent = ({
  objectMetadataItem,
  isInSidePanel,
  displayType,
  containerType,
  children,
  selectedRecordId,
}: CommandMenuContextProviderWorkflowObjectsProps & {
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

  const commandMenuItems = useRegisteredCommandMenuItems(
    shouldBeRegisteredParams,
  );

  const runWorkflowRecordAgnosticCommands =
    useRunWorkflowRecordAgnosticCommands();

  const commandMenuContextApi = useCommandMenuContextApi();

  const commandMenuItemFrontComponentActions =
    useCommandMenuItemFrontComponentActions(commandMenuContextApi);

  return (
    <CommandMenuContext.Provider
      value={{
        isInSidePanel,
        displayType,
        containerType,
        commandMenuItems: [
          ...commandMenuItems,
          ...runWorkflowRecordAgnosticCommands,
          ...commandMenuItemFrontComponentActions,
        ],
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );
};

const CommandMenuContextProviderWorkflowObjectsWithoutWorkflow = ({
  objectMetadataItem,
  isInSidePanel,
  displayType,
  containerType,
  children,
}: CommandMenuContextProviderWorkflowObjectsProps & {
  workflowWithCurrentVersion: WorkflowWithCurrentVersion | undefined;
}) => {
  const params = useShouldCommandMenuItemBeRegisteredParams({
    objectMetadataItem,
  });

  const shouldBeRegisteredParams = {
    ...params,
    workflowWithCurrentVersion: undefined,
  };

  const commandMenuItems = useRegisteredCommandMenuItems(
    shouldBeRegisteredParams,
  );

  const runWorkflowRecordAgnosticCommands =
    useRunWorkflowRecordAgnosticCommands();

  const commandMenuContextApi = useCommandMenuContextApi();

  const commandMenuItemFrontComponentActions =
    useCommandMenuItemFrontComponentActions(commandMenuContextApi);

  return (
    <CommandMenuContext.Provider
      value={{
        isInSidePanel,
        displayType,
        containerType,
        commandMenuItems: [
          ...commandMenuItems,
          ...runWorkflowRecordAgnosticCommands,
          ...commandMenuItemFrontComponentActions,
        ],
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );
};

export const CommandMenuContextProviderWorkflowObjects = ({
  objectMetadataItem,
  isInSidePanel,
  displayType,
  containerType,
  children,
}: CommandMenuContextProviderWorkflowObjectsProps) => {
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
      <CommandMenuContextProviderWorkflowObjectsContent
        objectMetadataItem={objectMetadataItem}
        isInSidePanel={isInSidePanel}
        displayType={displayType}
        containerType={containerType}
        selectedRecordId={selectedRecord.id}
      >
        {children}
      </CommandMenuContextProviderWorkflowObjectsContent>
    );
  }

  return (
    <CommandMenuContextProviderWorkflowObjectsWithoutWorkflow
      objectMetadataItem={objectMetadataItem}
      isInSidePanel={isInSidePanel}
      displayType={displayType}
      containerType={containerType}
      workflowWithCurrentVersion={undefined}
    >
      {children}
    </CommandMenuContextProviderWorkflowObjectsWithoutWorkflow>
  );
};
