import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type ComponentState } from '@/ui/utilities/state/component-state/types/ComponentState';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { useRecoilState } from 'recoil';

export const useRecoilComponentState = <StateType>(
  componentState: ComponentState<StateType>,
  instanceIdFromProps?: string,
) => {
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

  return useRecoilState(componentState.atomFamily({ instanceId }));
};
