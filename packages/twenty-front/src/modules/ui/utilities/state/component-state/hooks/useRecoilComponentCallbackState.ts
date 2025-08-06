/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { ComponentFamilyReadOnlySelector } from '@/ui/utilities/state/component-state/types/ComponentFamilyReadOnlySelector';
import { ComponentFamilySelector } from '@/ui/utilities/state/component-state/types/ComponentFamilySelector';
import { ComponentFamilyState } from '@/ui/utilities/state/component-state/types/ComponentFamilyState';
import { ComponentReadOnlySelector } from '@/ui/utilities/state/component-state/types/ComponentReadOnlySelector';
import { ComponentSelector } from '@/ui/utilities/state/component-state/types/ComponentSelector';
import { ComponentState } from '@/ui/utilities/state/component-state/types/ComponentState';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { RecoilState, RecoilValueReadOnly, SerializableParam } from 'recoil';

export function useRecoilComponentCallbackState<ValueType>(
  componentState: ComponentState<ValueType>,
  instanceIdFromProps?: string,
): RecoilState<ValueType>;
export function useRecoilComponentCallbackState<ValueType>(
  componentSelector: ComponentSelector<ValueType>,
  instanceIdFromProps?: string,
): RecoilState<ValueType>;
export function useRecoilComponentCallbackState<ValueType>(
  componentReadOnlySelector: ComponentReadOnlySelector<ValueType>,
  instanceIdFromProps?: string,
): RecoilValueReadOnly<ValueType>;
export function useRecoilComponentCallbackState<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyState: ComponentFamilyState<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentCallbackState<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilySelector: ComponentFamilySelector<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentCallbackState<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyReadOnlySelector: ComponentFamilyReadOnlySelector<
    ValueType,
    FamilyKey
  >,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilValueReadOnly<ValueType>;
export function useRecoilComponentCallbackState<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyState: ComponentFamilyState<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentCallbackState<
  InferedComponentState extends
    | ComponentState<ValueType>
    | ComponentSelector<ValueType>
    | ComponentReadOnlySelector<ValueType>
    | ComponentFamilyState<ValueType, FamilyKey>
    | ComponentFamilySelector<ValueType, FamilyKey>
    | ComponentFamilyReadOnlySelector<ValueType, FamilyKey>,
  ValueType,
  FamilyKey extends SerializableParam = never,
>(
  componentState: InferedComponentState,
  instanceIdFromProps?: string,
):
  | RecoilState<ValueType>
  | RecoilValueReadOnly<ValueType>
  | ((familyKey: FamilyKey) => RecoilState<ValueType>)
  | ((familyKey: FamilyKey) => RecoilValueReadOnly<ValueType>) {
  const componentStateKey = componentState.key;

  const componentInstanceContext =
    globalComponentInstanceContextMap.get(componentStateKey);

  if (!componentInstanceContext) {
    throw new Error(
      `Instance context for key "${componentStateKey}" is not defined, check the component state declaration.`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    componentInstanceContext,
    instanceIdFromProps,
  );

  switch (componentState.type) {
    case 'ComponentState': {
      return componentState.atomFamily({
        instanceId,
      });
    }
    case 'ComponentSelector': {
      return componentState.selectorFamily({
        instanceId,
      });
    }
    case 'ComponentReadOnlySelector': {
      return componentState.selectorFamily({
        instanceId,
      });
    }
    case 'ComponentFamilyState': {
      return (familyKey: FamilyKey) =>
        componentState.atomFamily({
          instanceId,
          familyKey,
        });
    }
    case 'ComponentFamilySelector': {
      return (familyKey: FamilyKey) =>
        componentState.selectorFamily({
          instanceId,
          familyKey,
        });
    }
    case 'ComponentFamilyReadOnlySelector': {
      return (familyKey: FamilyKey) =>
        componentState.selectorFamily({
          instanceId,
          familyKey,
        });
    }
  }
}
