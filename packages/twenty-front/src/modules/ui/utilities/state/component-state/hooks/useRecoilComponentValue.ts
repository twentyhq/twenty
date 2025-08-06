import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { ComponentReadOnlySelector } from '@/ui/utilities/state/component-state/types/ComponentReadOnlySelector';
import { ComponentSelector } from '@/ui/utilities/state/component-state/types/ComponentSelector';
import { ComponentState } from '@/ui/utilities/state/component-state/types/ComponentState';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { RecoilState, RecoilValueReadOnly, useRecoilValue } from 'recoil';

export const useRecoilComponentValue = <StateType>(
  componentState:
    | ComponentState<StateType>
    | ComponentSelector<StateType>
    | ComponentReadOnlySelector<StateType>,
  instanceIdFromProps?: string,
) => {
  const instanceContext = globalComponentInstanceContextMap.get(
    componentState.key,
  );

  if (!instanceContext) {
    throw new Error(
      `Instance context for key "${componentState.key}" is not defined`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    instanceContext,
    instanceIdFromProps,
  );

  let state: RecoilState<StateType> | RecoilValueReadOnly<StateType>;

  if (componentState.type === 'ComponentState') {
    state = componentState.atomFamily({ instanceId });
  } else if (
    componentState.type === 'ComponentSelector' ||
    componentState.type === 'ComponentReadOnlySelector'
  ) {
    state = componentState.selectorFamily({ instanceId });
  } else {
    throw new Error('Invalid component state type');
  }

  return useRecoilValue(state);
};
