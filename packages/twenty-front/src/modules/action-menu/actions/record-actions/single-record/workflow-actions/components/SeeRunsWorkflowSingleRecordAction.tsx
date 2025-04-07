import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';

export const SeeRunsWorkflowSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  return (
    <ActionLink
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.WorkflowRun }}
      queryParams={{
        filter: {
          workflow: {
            [ViewFilterOperand.Is]: {
              selectedRecordIds: [workflowWithCurrentVersion?.id],
            },
          },
        },
      }}
    />
  );
};
