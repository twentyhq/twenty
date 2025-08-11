/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type ComponentFamilyReadOnlySelector } from '@/ui/utilities/state/component-state/types/ComponentFamilyReadOnlySelector';
import { type ComponentFamilySelector } from '@/ui/utilities/state/component-state/types/ComponentFamilySelector';
import { type ComponentFamilyState } from '@/ui/utilities/state/component-state/types/ComponentFamilyState';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { useCallback } from 'react';
import {
  type RecoilState,
  type RecoilValueReadOnly,
  type SerializableParam,
} from 'recoil';

export function useRecoilComponentFamilyCallbackState<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyState: ComponentFamilyState<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentFamilyCallbackState<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilySelector: ComponentFamilySelector<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentFamilyCallbackState<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyReadOnlySelector: ComponentFamilyReadOnlySelector<
    ValueType,
    FamilyKey
  >,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilValueReadOnly<ValueType>;
export function useRecoilComponentFamilyCallbackState<
  ValueType,
  FamilyKey extends SerializableParam,
>(
  componentFamilyState: ComponentFamilyState<ValueType, FamilyKey>,
  instanceIdFromProps?: string,
): (familyKey: FamilyKey) => RecoilState<ValueType>;
export function useRecoilComponentFamilyCallbackState<
  ComponentState extends
    | ComponentFamilyState<ValueType, FamilyKey>
    | ComponentFamilySelector<ValueType, FamilyKey>
    | ComponentFamilyReadOnlySelector<ValueType, FamilyKey>,
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
