import { showPageWorkflowSelectedNodeState } from '@/workflow/states/showPageWorkflowSelectedNodeState';
import { useRecoilValue } from 'recoil';

export const RightDrawerWorkflowEditStep = () => {
  const showPageWorkflowSelectedNode = useRecoilValue(
    showPageWorkflowSelectedNodeState,
  );

  return <p>{showPageWorkflowSelectedNode}</p>;
};
