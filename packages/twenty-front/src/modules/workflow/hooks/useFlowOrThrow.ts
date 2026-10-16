import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useFlowOrThrow = () => {
  const flow = useAtomComponentStateValue(flowComponentState);

  if (!isDefined(flow)) {
    throw new Error(doNotTranslate('Expected the flow to be defined'));
  }

  return flow;
};
