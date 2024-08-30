import { useScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useScopeInternalContext';
import { ComponentFamilyState } from '@/ui/utilities/state/component-state/types/ComponentFamilyState';
import { RecoilComponentState } from '@/ui/utilities/state/component-state/types/RecoilComponentState';

export const useScopeIdFromStateContext = (
  componentState: RecoilComponentState<any> | ComponentFamilyState<any, any>,
) => {
  const componentContext = (window as any).componentContextStateMap?.get(
    componentState.key,
  );

  if (!componentContext) {
    throw new Error(
      `Component context for key "${componentState.key}" is not defined`,
    );
  }

  const scopeInternalContext = useScopeInternalContext(componentContext);

  const scopeIdFromContext = scopeInternalContext?.scopeId;

  return { scopeId: scopeIdFromContext };
};
