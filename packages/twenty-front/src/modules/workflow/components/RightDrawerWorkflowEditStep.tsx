import { RightDrawerWorkflowEditStepContent } from '@/workflow/components/RightDrawerWorkflowEditStepContent';
import { useFindShowPageWorkflow } from '@/workflow/hooks/useFindShowPageWorkflow';
import { isDefined } from 'twenty-ui';

export const RightDrawerWorkflowEditStep = () => {
  const workflow = useFindShowPageWorkflow();

  if (!isDefined(workflow)) {
    return null;
  }

  return <RightDrawerWorkflowEditStepContent workflow={workflow} />;
};
