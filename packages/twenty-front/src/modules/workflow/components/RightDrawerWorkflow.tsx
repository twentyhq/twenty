import { RightDrawerSelectAction } from '@/workflow/components/RightDrawerSelectAction';
import { rightDrawerWorkflowState } from '@/workflow/states/rightDrawerWorkflowState';
import { useRecoilValue } from 'recoil';

export const RightDrawerWorkflow = () => {
  const rightDrawerWorkflow = useRecoilValue(rightDrawerWorkflowState);

  if (rightDrawerWorkflow === undefined) {
    return null;
  }

  // FIXME: find a better way to return null at the end of the component without ESLint telling us that it should be an Effect component.
  if (rightDrawerWorkflow.type !== 'select-action') {
    return null;
  }

  return <RightDrawerSelectAction />;
};
