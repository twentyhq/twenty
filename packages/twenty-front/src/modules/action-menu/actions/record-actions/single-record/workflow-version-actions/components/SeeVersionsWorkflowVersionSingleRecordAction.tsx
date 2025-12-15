import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useRecoilValue } from 'recoil';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const SeeVersionsWorkflowVersionSingleRecordActionContent = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  return (
    <ActionLink
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.WorkflowVersion }}
      queryParams={{
        filter: {
          workflow: {
            [ViewFilterOperand.IS]: {
              selectedRecordIds: [workflowWithCurrentVersion?.id],
            },
          },
        },
      }}
    />
  );
};

export const SeeVersionsWorkflowVersionSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));

  if (!isDefined(workflowVersion) || !isDefined(workflowVersion.workflowId)) {
    return null;
  }

  return (
    <SeeVersionsWorkflowVersionSingleRecordActionContent
      workflowId={workflowVersion.workflowId}
    />
  );
};
