import { useRunWorkflowRecordAgnosticActions } from '@/action-menu/actions/record-agnostic-actions/run-workflow-actions/hooks/useRunWorkflowRecordAgnosticActions';
import {
  ActionMenuContext,
  type ActionMenuContextType,
} from '@/action-menu/contexts/ActionMenuContext';
import { useRegisteredActions } from '@/action-menu/hooks/useRegisteredActions';
import { useShouldActionBeRegisteredParams } from '@/action-menu/hooks/useShouldActionBeRegisteredParams';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type ActionMenuContextProviderWorkflowObjectsProps = {
  objectMetadataItem: ObjectMetadataItem;
  isInRightDrawer: ActionMenuContextType['isInRightDrawer'];
  displayType: ActionMenuContextType['displayType'];
  actionMenuType: ActionMenuContextType['actionMenuType'];
  children: React.ReactNode;
};

const ActionMenuContextProviderWorkflowObjectsContent = ({
  objectMetadataItem,
  isInRightDrawer,
  displayType,
  actionMenuType,
  children,
  selectedRecordId,
}: ActionMenuContextProviderWorkflowObjectsProps & {
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

  return (
    <ActionMenuContext.Provider
      value={{
        isInRightDrawer,
        displayType,
        actionMenuType,
        actions: [...actions, ...runWorkflowRecordAgnosticActions],
      }}
    >
      {children}
    </ActionMenuContext.Provider>
  );
};

const ActionMenuContextProviderWorkflowObjectsWithoutWorkflow = ({
  objectMetadataItem,
  isInRightDrawer,
  displayType,
  actionMenuType,
  children,
}: ActionMenuContextProviderWorkflowObjectsProps & {
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

  return (
    <ActionMenuContext.Provider
      value={{
        isInRightDrawer,
        displayType,
        actionMenuType,
        actions: [...actions, ...runWorkflowRecordAgnosticActions],
      }}
    >
      {children}
    </ActionMenuContext.Provider>
  );
};

export const ActionMenuContextProviderWorkflowObjects = ({
  objectMetadataItem,
  isInRightDrawer,
  displayType,
  actionMenuType,
  children,
}: ActionMenuContextProviderWorkflowObjectsProps) => {
  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const recordId =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 1
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const selectedRecord =
    useRecoilValue(recordStoreFamilyState(recordId ?? '')) || undefined;

  if (isDefined(selectedRecord?.id)) {
    return (
      <ActionMenuContextProviderWorkflowObjectsContent
        objectMetadataItem={objectMetadataItem}
        isInRightDrawer={isInRightDrawer}
        displayType={displayType}
        actionMenuType={actionMenuType}
        selectedRecordId={selectedRecord.id}
      >
        {children}
      </ActionMenuContextProviderWorkflowObjectsContent>
    );
  }

  return (
    <ActionMenuContextProviderWorkflowObjectsWithoutWorkflow
      objectMetadataItem={objectMetadataItem}
      isInRightDrawer={isInRightDrawer}
      displayType={displayType}
      actionMenuType={actionMenuType}
      workflowWithCurrentVersion={undefined}
    >
      {children}
    </ActionMenuContextProviderWorkflowObjectsWithoutWorkflow>
  );
};
