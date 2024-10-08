import { RightDrawerWorkflowViewStepContent } from '@/workflow/components/RightDrawerWorkflowViewStepContent';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { workflowVersionIdState } from '@/workflow/states/workflowVersionIdState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const RightDrawerWorkflowViewStep = () => {
  const workflowVersionId = useRecoilValue(workflowVersionIdState);
  if (!isDefined(workflowVersionId)) {
    throw new Error('Expected a workflow version id');
  }

  const workflowVersion = useWorkflowVersion(workflowVersionId);

  if (!isDefined(workflowVersion)) {
    return null;
  }

  return (
    <RightDrawerWorkflowViewStepContent workflowVersion={workflowVersion} />
  );
};
