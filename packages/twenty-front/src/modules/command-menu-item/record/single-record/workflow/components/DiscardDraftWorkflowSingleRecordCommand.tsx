import { Command } from '@/command-menu-item/display/components/Command';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useDeleteOneWorkflowVersion } from '@/workflow/hooks/useDeleteOneWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';

export const DiscardDraftWorkflowSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { deleteOneWorkflowVersion } = useDeleteOneWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  const onClick = () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    deleteOneWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
    });
  };

  return <Command onClick={onClick} />;
};
