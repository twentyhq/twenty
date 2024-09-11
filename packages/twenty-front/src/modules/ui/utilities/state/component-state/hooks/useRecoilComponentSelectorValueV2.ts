import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { ComponentReadOnlySelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentReadOnlySelectorV2';
import { ComponentSelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentSelectorV2';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { useRecoilValue } from 'recoil';

export const useRecoilComponentSelectorValueV2 = <StateType>(
  componentSelector:
    | ComponentSelectorV2<StateType>
    | ComponentReadOnlySelectorV2<StateType>,
  instanceIdFromProps?: string,
) => {
  const componentInstanceContext = globalComponentInstanceContextMap.get(
    componentSelector.key,
  );

  if (!componentInstanceContext) {
    throw new Error(
      `Instance context for key "${componentSelector.key}" is not defined`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    componentInstanceContext,
    instanceIdFromProps,
  );

  return useRecoilValue(componentSelector.selectorFamily({ instanceId }));
};
