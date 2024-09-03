import { useAvailableInstanceIdOrThrow } from '@/ui/utilities/state/instance/hooks/useAvailableInstanceIdOrThrow';
import { InstanceState } from '@/ui/utilities/state/instance/types/InstanceState';
import { globalInstanceContextMap } from '@/ui/utilities/state/instance/utils/globalInstanceContextMap';
import { useSetRecoilState } from 'recoil';

export const useSetRecoilInstanceState = <StateType>(
  instanceState: InstanceState<StateType>,
  instanceIdFromProps?: string,
) => {
  const instanceContext = globalInstanceContextMap.get(instanceState.key);

  if (!instanceContext) {
    throw new Error(
      `Instance context for key "${instanceState.key}" is not defined`,
    );
  }

  const instanceId = useAvailableInstanceIdOrThrow(
    instanceContext,
    instanceIdFromProps,
  );

  return useSetRecoilState(instanceState.atomFamily({ instanceId }));
};
