import { flowState } from '@/workflow/states/flowState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useFlowOrThrow = () => {
  const flow = useRecoilValue(flowState);
  if (!isDefined(flow)) {
    throw new Error('Expected the flow to be defined');
  }

  return flow;
};
