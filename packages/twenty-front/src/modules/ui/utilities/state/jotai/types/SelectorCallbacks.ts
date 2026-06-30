import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { type ComponentFamilySelector } from '@/ui/utilities/state/jotai/types/ComponentFamilySelector';
import {
  type ComponentFamilyStateKey,
  type ComponentFamilyState,
} from '@/ui/utilities/state/jotai/types/ComponentFamilyState';
import { type ComponentSelector } from '@/ui/utilities/state/jotai/types/ComponentSelector';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { type FamilySelector } from '@/ui/utilities/state/jotai/types/FamilySelector';
import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';
import { type Selector } from '@/ui/utilities/state/jotai/types/Selector';
import { type State } from '@/ui/utilities/state/jotai/types/State';

export type SelectorGetter = {
  get: {
    <ValueType>(state: State<ValueType> | Selector<ValueType>): ValueType;
    <ValueType, FamilyKey>(
      familyState:
        | FamilyState<ValueType, FamilyKey>
        | FamilySelector<ValueType, FamilyKey>,
      familyKey: FamilyKey,
    ): ValueType;
    <ValueType>(
      componentState: ComponentState<ValueType>,
      key: ComponentStateKey,
    ): ValueType;
    <ValueType, FamilyKey>(
      componentFamilyState: ComponentFamilyState<ValueType, FamilyKey>,
      key: ComponentFamilyStateKey<FamilyKey>,
    ): ValueType;
    <ValueType>(
      componentSelector: ComponentSelector<ValueType>,
      key: ComponentStateKey,
    ): ValueType;
    <ValueType, FamilyKey>(
      componentFamilySelector: ComponentFamilySelector<ValueType, FamilyKey>,
      key: ComponentFamilyStateKey<FamilyKey>,
    ): ValueType;
  };
};

export type SelectorSetter = SelectorGetter & {
  set: {
    <ValueType>(
      state: State<ValueType>,
      value: ValueType | ((prev: ValueType) => ValueType),
    ): void;
    <ValueType, FamilyKey>(
      familyState: FamilyState<ValueType, FamilyKey>,
      familyKey: FamilyKey,
      value: ValueType | ((prev: ValueType) => ValueType),
    ): void;
  };
};
