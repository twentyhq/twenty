import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { ComponentStateV2 } from '@/ui/utilities/state/component-state/types/ComponentStateV2';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { useRecoilValue } from 'recoil';

export const useRecoilComponentValueV2 = <StateType>(
  componentStateV2: ComponentStateV2<StateType>,
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

  return useRecoilValue(componentStateV2.atomFamily({ instanceId }));
};
