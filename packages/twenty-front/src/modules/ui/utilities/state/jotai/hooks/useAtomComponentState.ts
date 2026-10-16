import { useAtom } from 'jotai';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';

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
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This missing component state is a developer invariant diagnostic.
      `Instance context for key "${componentState.key}" is not defined`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    componentInstanceContext,
    instanceIdFromProps,
  );

  return useAtom(componentState.atomFamily({ instanceId }));
};
