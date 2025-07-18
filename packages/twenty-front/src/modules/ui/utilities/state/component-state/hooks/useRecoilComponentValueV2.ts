import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { ComponentReadOnlySelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentReadOnlySelectorV2';
import { ComponentSelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentSelectorV2';
import { ComponentStateV2 } from '@/ui/utilities/state/component-state/types/ComponentStateV2';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { RecoilState, RecoilValueReadOnly, useRecoilValue } from 'recoil';

export const useRecoilComponentValueV2 = <StateType>(
  componentStateV2:
    | ComponentStateV2<StateType>
    | ComponentSelectorV2<StateType>
    | ComponentReadOnlySelectorV2<StateType>,
  instanceIdFromProps?: string,
) => {
  const instanceContext = globalComponentInstanceContextMap.get(
    componentStateV2.key,
  );

  if (!instanceContext) {
    throw new Error(
      `Instance context for key "${componentStateV2.key}" is not defined`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    instanceContext,
    instanceIdFromProps,
  );

  let state: RecoilState<StateType> | RecoilValueReadOnly<StateType>;

  if (componentStateV2.type === 'ComponentState') {
    state = componentStateV2.atomFamily({ instanceId });
  } else if (
    componentStateV2.type === 'ComponentSelector' ||
    componentStateV2.type === 'ComponentReadOnlySelector'
  ) {
    state = componentStateV2.selectorFamily({ instanceId });
  } else {
    throw new Error('Invalid component state type');
  }

  return useRecoilValue(state);
};
