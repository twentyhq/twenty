import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { type ComponentFamilySelectorV2 } from '@/ui/utilities/state/jotai/types/ComponentFamilySelectorV2';
import {
  type ComponentFamilyStateKey,
  type ComponentFamilyStateV2,
} from '@/ui/utilities/state/jotai/types/ComponentFamilyStateV2';
import { type ComponentSelectorV2 } from '@/ui/utilities/state/jotai/types/ComponentSelectorV2';
import { type ComponentStateV2 } from '@/ui/utilities/state/jotai/types/ComponentStateV2';
import { type FamilySelectorV2 } from '@/ui/utilities/state/jotai/types/FamilySelectorV2';
import { type FamilyStateV2 } from '@/ui/utilities/state/jotai/types/FamilyStateV2';
import { type SelectorV2 } from '@/ui/utilities/state/jotai/types/SelectorV2';
import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

export type SelectorGetterV2 = {
  get: {
    <ValueType>(state: StateV2<ValueType> | SelectorV2<ValueType>): ValueType;
    <ValueType, FamilyKey>(
      familyState:
        | FamilyStateV2<ValueType, FamilyKey>
        | FamilySelectorV2<ValueType, FamilyKey>,
      familyKey: FamilyKey,
    ): ValueType;
    <ValueType>(
      componentState: ComponentStateV2<ValueType>,
      key: ComponentStateKey,
    ): ValueType;
    <ValueType, FamilyKey>(
      componentFamilyState: ComponentFamilyStateV2<ValueType, FamilyKey>,
      key: ComponentFamilyStateKey<FamilyKey>,
    ): ValueType;
    <ValueType>(
      componentSelector: ComponentSelectorV2<ValueType>,
      key: ComponentStateKey,
    ): ValueType;
    <ValueType, FamilyKey>(
      componentFamilySelector: ComponentFamilySelectorV2<ValueType, FamilyKey>,
      key: ComponentFamilyStateKey<FamilyKey>,
    ): ValueType;
  };
};

export type SelectorSetterV2 = SelectorGetterV2 & {
  set: {
    <ValueType>(
      state: StateV2<ValueType>,
      value: ValueType | ((prev: ValueType) => ValueType),
    ): void;
    <ValueType, FamilyKey>(
      familyState: FamilyStateV2<ValueType, FamilyKey>,
      familyKey: FamilyKey,
      value: ValueType | ((prev: ValueType) => ValueType),
    ): void;
  };
};
