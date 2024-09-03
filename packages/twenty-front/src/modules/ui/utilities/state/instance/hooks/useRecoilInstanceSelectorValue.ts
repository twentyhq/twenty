import { useAvailableInstanceIdOrThrow } from '@/ui/utilities/state/instance/hooks/useAvailableInstanceIdOrThrow';
import { InstanceReadOnlySelector } from '@/ui/utilities/state/instance/types/InstanceReadOnlySelector';
import { InstanceSelector } from '@/ui/utilities/state/instance/types/InstanceSelector';
import { globalInstanceContextMap } from '@/ui/utilities/state/instance/utils/globalInstanceContextMap';
import { useRecoilValue } from 'recoil';

export const useRecoilInstanceSelectorValue = <StateType>(
  instanceSelector:
    | InstanceSelector<StateType>
    | InstanceReadOnlySelector<StateType>,
  instanceIdFromProps?: string,
) => {
  const instanceContext = globalInstanceContextMap.get(instanceSelector.key);

  if (!instanceContext) {
    throw new Error(
      `Instance context for key "${instanceSelector.key}" is not defined`,
    );
  }

  const instanceId = useAvailableInstanceIdOrThrow(
    instanceContext,
    instanceIdFromProps,
  );

  return useRecoilValue(instanceSelector.selectorFamily({ instanceId }));
};
