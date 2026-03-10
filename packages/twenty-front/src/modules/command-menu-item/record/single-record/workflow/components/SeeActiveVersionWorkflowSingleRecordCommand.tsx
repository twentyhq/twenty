import { CommandLink } from '@/command-menu-item/display/components/CommandLink';
import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';

export const SeeActiveVersionWorkflowSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const { workflowVersion, loading } = useActiveWorkflowVersion({
    workflowId: recordId,
  });

  if (loading) {
    return <CommandMenuItemDisplay />;
  }

  return (
    <CommandLink
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        objectRecordId: workflowVersion.id,
      }}
    />
  );
};
