import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';

export const SeeActiveVersionWorkflowSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const { workflowVersion, loading } = useActiveWorkflowVersion({
    workflowId: recordId,
  });

  if (loading) {
    return null;
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
