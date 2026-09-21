import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const SeeVersionWorkflowRunSingleRecordCommand = () => {
  const isCore = useIsWorkflowCoreEnabled();
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];

  if (isCore) {
    const coreWorkflowId = selectedRecord?.coreWorkflowId;
    const coreWorkflowVersionId = selectedRecord?.coreWorkflowVersionId;
    return isDefined(coreWorkflowId) && isDefined(coreWorkflowVersionId) ? (
      <HeadlessNavigateEngineCommand
        to={AppPath.WorkflowCoreShowPage}
        params={{ coreWorkflowId }}
        queryParams={{ version: coreWorkflowVersionId }}
      />
    ) : null;
  }

  if (
    !isDefined(selectedRecord) ||
    !isDefined(selectedRecord?.workflowVersion?.id)
  ) {
    throw new Error('Selected record is required to see version workflow run');
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        objectRecordId: selectedRecord.workflowVersion.id,
      }}
    />
  );
};
