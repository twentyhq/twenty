import { CommandMenuItemLink } from '@/command-menu-item/actions/components/CommandMenuItemLink';
import { CommandMenuItemDisplay } from '@/command-menu-item/actions/display/components/CommandMenuItemDisplay';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';

export const SeeActiveVersionWorkflowSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const { workflowVersion, loading } = useActiveWorkflowVersion({
    workflowId: recordId,
  });

  if (loading) {
    return <CommandMenuItemDisplay />;
  }

  return (
    <CommandMenuItemLink
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        objectRecordId: workflowVersion.id,
      }}
    />
  );
};
