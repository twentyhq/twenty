import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { ComponentFamilyState } from '@/ui/utilities/state/component-state/types/ComponentFamilyState';
import { SerializableParam } from 'recoil';

export const useExtractedComponentFamilyStateV2 = <
  FamilyKey extends SerializableParam,
  Value,
>(
  componentFamilyState: ComponentFamilyState<Value, FamilyKey>,
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

  const internalScopeId = useAvailableScopeIdOrThrow(
    componentContext,
    componentId,
  );

  const extractedComponentFamilyState = (familyKey: FamilyKey) =>
    componentFamilyState.atomFamily({
      scopeId: internalScopeId,
      familyKey,
    });

  return extractedComponentFamilyState;
};
