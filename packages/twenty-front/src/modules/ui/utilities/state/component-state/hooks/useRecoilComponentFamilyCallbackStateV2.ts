/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { ComponentFamilyReadOnlySelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyReadOnlySelectorV2';
import { ComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilySelectorV2';
import { ComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateV2';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { useCallback } from 'react';
import { RecoilState, RecoilValueReadOnly, SerializableParam } from 'recoil';

export function useRecoilComponentFamilyCallbackStateV2<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyState: ComponentFamilyStateV2<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentFamilyCallbackStateV2<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilySelector: ComponentFamilySelectorV2<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentFamilyCallbackStateV2<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyReadOnlySelector: ComponentFamilyReadOnlySelectorV2<
    ValueType,
    FamilyKey
  >,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilValueReadOnly<ValueType>;
export function useRecoilComponentFamilyCallbackStateV2<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyState: ComponentFamilyStateV2<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentFamilyCallbackStateV2<
  ComponentState extends
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

  return useCallback(
    (familyKey: FamilyKey) => {
      switch (componentState.type) {
        case 'ComponentFamilyState': {
          return componentState.atomFamily({
            instanceId,
            familyKey,
          });
        }
        case 'ComponentFamilySelector': {
          return componentState.selectorFamily({
            instanceId,
            familyKey,
          });
        }
        case 'ComponentFamilyReadOnlySelector': {
          return componentState.selectorFamily({
            instanceId,
            familyKey,
          });
        }
      }
    },
    [componentState, instanceId],
  );
}
