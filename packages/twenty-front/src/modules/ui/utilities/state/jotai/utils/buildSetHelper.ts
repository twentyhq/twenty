import { type Setter } from 'jotai';

import { type FamilyStateV2 } from '@/ui/utilities/state/jotai/types/FamilyStateV2';
import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

export const buildSetHelper =
  (jotaiSet: Setter) =>
  <ValueType, FamilyKey = never>(
    stateOrFamily: StateV2<ValueType> | FamilyStateV2<ValueType, FamilyKey>,
    valueOrFamilyKey: ValueType | ((prev: ValueType) => ValueType) | FamilyKey,
    familyValue?: ValueType | ((prev: ValueType) => ValueType),
  ): void => {
    if (stateOrFamily.type === 'FamilyStateV2') {
      jotaiSet(
        (stateOrFamily as FamilyStateV2<ValueType, FamilyKey>).atomFamily(
          valueOrFamilyKey as FamilyKey,
        ),
        familyValue as ValueType | ((prev: ValueType) => ValueType),
      );
      return;
    }

    jotaiSet(
      (stateOrFamily as StateV2<ValueType>).atom,
      valueOrFamilyKey as ValueType | ((prev: ValueType) => ValueType),
    );
  };
