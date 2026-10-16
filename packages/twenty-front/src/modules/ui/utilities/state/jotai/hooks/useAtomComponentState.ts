import { useAtom } from 'jotai';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useAtomComponentState = <StateType>(
  componentState: ComponentState<StateType>,
  instanceIdFromProps?: string,
): [
  StateType,
  (value: StateType | ((prev: StateType) => StateType)) => void,
] => {
  const componentInstanceContext = globalComponentInstanceContextMap.get(
    componentState.key,
  );

  if (!componentInstanceContext) {
    throw new Error(
      doNotTranslate(
        `Instance context for key "${componentState.key}" is not defined`,
      ),
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    componentInstanceContext,
    instanceIdFromProps,
  );

  return useAtom(componentState.atomFamily({ instanceId }));
};
