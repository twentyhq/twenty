import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useRecoilValue } from 'recoil';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';

export const SeeRunsWorkflowVersionSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVersion?.workflow.id,
  );

  return (
    <ActionLink
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.WorkflowRun }}
      queryParams={{
        filter: {
          workflow: {
            [ViewFilterOperand.IS]: {
              selectedRecordIds: [workflowWithCurrentVersion?.id],
            },
          },
          workflowVersion: {
            [ViewFilterOperand.IS]: {
              selectedRecordIds: [recordId],
            },
          },
        },
      }}
    />
  );
};
