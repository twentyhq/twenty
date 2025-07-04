import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isUpdatingWorkflowFamilyState } from '@/workflow/states/isUpdatingWorkflowFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const TestWorkflowSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { runWorkflowVersion } = useRunWorkflowVersion();

  const isUpdatingWorkflow = useRecoilValue(
    isUpdatingWorkflowFamilyState(recordId ?? ''),
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId,
    isUpdatingWorkflow,
  );

  const onClick = () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    runWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
      workflowId: workflowWithCurrentVersion.id,
    });
  };

  return <Action onClick={onClick} />;
};
