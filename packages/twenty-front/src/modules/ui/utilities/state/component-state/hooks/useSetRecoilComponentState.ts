import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { ComponentState } from '@/ui/utilities/state/component-state/types/ComponentState';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { SetterOrUpdater, useSetRecoilState } from 'recoil';

export const useSetRecoilComponentState = <ValueType>(
  componentState: ComponentState<ValueType>,
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

  return useSetRecoilState(componentState.atomFamily({ instanceId }));
};
