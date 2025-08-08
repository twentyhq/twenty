import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useFlowOrThrow = () => {
  const flow = useRecoilComponentValue(flowComponentState);

  if (!isDefined(flow)) {
    throw new Error('Expected the flow to be defined');
  }

  return flow;
};
