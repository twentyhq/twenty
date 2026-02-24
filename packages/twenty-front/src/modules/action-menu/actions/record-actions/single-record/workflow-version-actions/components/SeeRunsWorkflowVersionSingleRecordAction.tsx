import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const SeeRunsWorkflowVersionSingleRecordActionContent = ({
  workflowId,
  recordId,
}: {
  workflowId: string;
  recordId: string;
}) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

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

export const SeeRunsWorkflowVersionSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowVersion = useFamilyRecoilValueV2(
    recordStoreFamilyState,
    recordId,
  );

  const workflowId = workflowVersion?.workflow?.id;

  if (!isDefined(workflowId)) {
    return null;
  }

  return (
    <SeeRunsWorkflowVersionSingleRecordActionContent
      workflowId={workflowId}
      recordId={recordId}
    />
  );
};
