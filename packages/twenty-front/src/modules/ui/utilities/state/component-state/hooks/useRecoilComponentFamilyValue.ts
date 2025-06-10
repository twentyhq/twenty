import { SerializableParam, useRecoilValue } from 'recoil';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { ComponentFamilyState } from '@/ui/utilities/state/component-state/types/ComponentFamilyState';

export const useRecoilComponentFamilyValue = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyState: ComponentFamilyState<StateType, FamilyKey>,
  familyKey: FamilyKey,
  componentId?: string,
) => {
  const componentContext = (window as any).componentContextStateMap?.get(
    componentFamilyState.key,
  );

  if (!componentContext) {
    throw new Error(
      `Component context for key "${componentFamilyState.key}" is not defined`,
    );
  }

  const internalComponentId = useAvailableScopeIdOrThrow(
    componentContext,
    componentId,
  );

  return useRecoilValue(
    componentFamilyState.atomFamily({
      scopeId: internalComponentId,
      familyKey,
    }),
  );
};
