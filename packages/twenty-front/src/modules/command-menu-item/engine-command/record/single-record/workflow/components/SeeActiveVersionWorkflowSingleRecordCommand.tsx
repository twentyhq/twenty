import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const SeeActiveVersionWorkflowSingleRecordCommand = () => {
  const isCore = useIsWorkflowCoreEnabled();
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;

  const { workflowVersion, loading } = useActiveWorkflowVersion({
    workflowId: recordId ?? '',
  });

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to see active version workflow');
  }

  if (loading || !isDefined(workflowVersion)) {
    return null;
  }

  if (isCore) {
    return (
      <HeadlessNavigateEngineCommand
        to={AppPath.WorkflowCoreShowPage}
        params={{ coreWorkflowId: recordId }}
        queryParams={{ version: workflowVersion.id }}
      />
    );
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        objectRecordId: workflowVersion.id,
      }}
    />
  );
};
