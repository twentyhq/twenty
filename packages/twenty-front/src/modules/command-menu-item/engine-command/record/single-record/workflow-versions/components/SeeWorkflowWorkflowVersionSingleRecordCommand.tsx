import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const SeeWorkflowWorkflowVersionSingleRecordCommand = () => {
  const isCore = useIsWorkflowCoreEnabled();
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];

  if (isCore) {
    const coreWorkflowId = selectedRecord?.workflowId;
    return isDefined(coreWorkflowId) ? (
      <HeadlessNavigateEngineCommand
        to={AppPath.WorkflowCoreShowPage}
        params={{ coreWorkflowId }}
      />
    ) : null;
  }

  if (!isDefined(selectedRecord) || !isDefined(selectedRecord?.workflow?.id)) {
    throw new Error(
      'Selected record and workflow ID are required to see workflow workflow version',
    );
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: selectedRecord.workflow.id,
      }}
    />
  );
};
