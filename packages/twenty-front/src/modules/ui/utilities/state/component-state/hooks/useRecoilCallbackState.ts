import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { RecoilComponentState } from '@/ui/utilities/state/component-state/types/RecoilComponentState';

export const useRecoilCallbackState = <Value>(
  componentState: RecoilComponentState<Value>,
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

  const internalScopeId = useAvailableScopeIdOrThrow(
    componentContext,
    getScopeIdOrUndefinedFromComponentId(componentId),
  );

  return componentState.atomFamily({
    scopeId: internalScopeId,
  });
};
