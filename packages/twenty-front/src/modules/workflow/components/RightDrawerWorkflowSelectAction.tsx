import { RightDrawerWorkflowSelectActionContent } from '@/workflow/components/RightDrawerWorkflowSelectActionContent';
import { useFindShowPageWorkflow } from '@/workflow/hooks/useFindShowPageWorkflow';
import { isDefined } from 'twenty-ui';

export const RightDrawerWorkflowSelectAction = () => {
  const workflow = useFindShowPageWorkflow();

  if (!isDefined(workflow)) {
    return null;
  }

  return <RightDrawerWorkflowSelectActionContent workflow={workflow} />;
};
