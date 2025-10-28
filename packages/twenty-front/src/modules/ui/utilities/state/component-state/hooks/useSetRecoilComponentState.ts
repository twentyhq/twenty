import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type ComponentSelector } from '@/ui/utilities/state/component-state/types/ComponentSelector';
import { type ComponentState } from '@/ui/utilities/state/component-state/types/ComponentState';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import {
  type RecoilState,
  type SetterOrUpdater,
  useSetRecoilState,
} from 'recoil';

export const useSetRecoilComponentState = <ValueType>(
  componentState: ComponentState<ValueType> | ComponentSelector<ValueType>,
  instanceIdFromProps?: string,
): SetterOrUpdater<ValueType> => {
  const componentInstanceContext = globalComponentInstanceContextMap.get(
    componentState.key,
  );

  if (!componentInstanceContext) {
    throw new Error(
      `Instance context for key "${componentState.key}" is not defined`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    componentInstanceContext,
    instanceIdFromProps,
  );

  let state: RecoilState<ValueType>;

  if (componentState.type === 'ComponentState') {
    state = componentState.atomFamily({ instanceId });
  } else if (componentState.type === 'ComponentSelector') {
    state = componentState.selectorFamily({ instanceId });
  } else {
    throw new Error('Invalid component state type');
  }

  return useSetRecoilState(state);
};
