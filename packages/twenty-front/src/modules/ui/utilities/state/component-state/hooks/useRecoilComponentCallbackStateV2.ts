/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { ComponentFamilyReadOnlySelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyReadOnlySelectorV2';
import { ComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilySelectorV2';
import { ComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateV2';
import { ComponentReadOnlySelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentReadOnlySelectorV2';
import { ComponentSelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentSelectorV2';
import { ComponentStateV2 } from '@/ui/utilities/state/component-state/types/ComponentStateV2';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { RecoilState, RecoilValueReadOnly, SerializableParam } from 'recoil';

export function useRecoilComponentCallbackStateV2<ValueType>(
  componentState: ComponentStateV2<ValueType>,
  instanceIdFromProps?: string,
): RecoilState<ValueType>;
export function useRecoilComponentCallbackStateV2<ValueType>(
  componentSelector: ComponentSelectorV2<ValueType>,
  instanceIdFromProps?: string,
): RecoilState<ValueType>;
export function useRecoilComponentCallbackStateV2<ValueType>(
  componentReadOnlySelector: ComponentReadOnlySelectorV2<ValueType>,
  instanceIdFromProps?: string,
): RecoilValueReadOnly<ValueType>;
export function useRecoilComponentCallbackStateV2<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyState: ComponentFamilyStateV2<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentCallbackStateV2<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilySelector: ComponentFamilySelectorV2<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentCallbackStateV2<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyReadOnlySelector: ComponentFamilyReadOnlySelectorV2<
    ValueType,
    FamilyKey
  >,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilValueReadOnly<ValueType>;
export function useRecoilComponentCallbackStateV2<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyState: ComponentFamilyStateV2<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentCallbackStateV2<
  ComponentState extends
    | ComponentStateV2<ValueType>
    | ComponentSelectorV2<ValueType>
    | ComponentReadOnlySelectorV2<ValueType>
    | ComponentFamilyStateV2<ValueType, FamilyKey>
    | ComponentFamilySelectorV2<ValueType, FamilyKey>
    | ComponentFamilyReadOnlySelectorV2<ValueType, FamilyKey>,
  ValueType,
  FamilyKey extends SerializableParam = never,
>(
  componentState: ComponentState,
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
