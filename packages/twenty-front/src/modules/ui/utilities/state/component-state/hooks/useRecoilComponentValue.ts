import { useRecoilValue } from 'recoil';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { RecoilComponentState } from '@/ui/utilities/state/component-state/types/RecoilComponentState';

export const useRecoilComponentValue = <StateType>(
  componentState: RecoilComponentState<StateType>,
  componentId?: string,
) => {
  const componentContext = (window as any).componentContextStateMap?.get(
    componentState.key,
  );

  if (!componentContext) {
    throw new Error(
      `Component context for key "${componentState.key}" is not defined`,
    );
  }

  const internalComponentId = useAvailableScopeIdOrThrow(
    componentContext,
    componentId,
  );

  return useRecoilValue(
    componentState.atomFamily({ scopeId: internalComponentId }),
  );
};
