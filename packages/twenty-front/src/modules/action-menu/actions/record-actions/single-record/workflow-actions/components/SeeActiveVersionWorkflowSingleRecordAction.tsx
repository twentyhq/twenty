import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from '@/types/AppPath';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';

export const SeeActiveVersionWorkflowSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const { workflowVersion, loading } = useActiveWorkflowVersion(recordId);

  if (loading) {
    return <ActionDisplay />;
  }

  return (
    <ActionLink
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        objectRecordId: workflowVersion.id,
      }}
    />
  );
};
