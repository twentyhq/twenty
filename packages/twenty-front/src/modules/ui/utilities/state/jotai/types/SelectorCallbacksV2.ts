import { type FamilyStateV2 } from '@/ui/utilities/state/jotai/types/FamilyStateV2';
import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

export type SelectorGetterV2 = {
  get: {
    <ValueType>(state: StateV2<ValueType>): ValueType;
    <ValueType, FamilyKey>(
      familyState: FamilyStateV2<ValueType, FamilyKey>,
      familyKey: FamilyKey,
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
