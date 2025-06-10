import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useFlowOrThrow = () => {
  const flow = useRecoilComponentValueV2(flowComponentState);

  if (!isDefined(flow)) {
    throw new Error('Expected the flow to be defined');
  }

  return flow;
};
