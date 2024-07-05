import { useRecoilValue } from 'recoil';

import { ComponentState } from '@/ui/utilities/state/component-state/types/ComponentState';

export const useRecoilComponentValue = <StateType>(
  componentState: ComponentState<StateType>,
  componentId?: string,
) => {
  // const componentContext = componentContextStateMap.get(componentState.key);

  // if (!componentContext) {
  //   throw new Error(
  //     `Component context for key "${componentState.key}" is not defined`,
  //   );
  // }

  // const internalComponentId = useAvailableScopeIdOrThrow(
  //   componentContext,
  //   getScopeIdOrUndefinedFromComponentId(componentId),
  // );

  return useRecoilValue(componentState.atomFamily({ scopeId: '' }));
};
