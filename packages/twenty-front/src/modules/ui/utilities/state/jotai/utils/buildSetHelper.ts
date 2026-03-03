import { type Setter } from 'jotai';

import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';
import { type State } from '@/ui/utilities/state/jotai/types/State';

export const buildSetHelper =
  (jotaiSet: Setter) =>
  <ValueType, FamilyKey = never>(
    stateOrFamily: State<ValueType> | FamilyState<ValueType, FamilyKey>,
    valueOrFamilyKey: ValueType | ((prev: ValueType) => ValueType) | FamilyKey,
    familyValue?: ValueType | ((prev: ValueType) => ValueType),
  ): void => {
    if (stateOrFamily.type === 'FamilyState') {
      jotaiSet(
        (stateOrFamily as FamilyState<ValueType, FamilyKey>).atomFamily(
          valueOrFamilyKey as FamilyKey,
        ),
        familyValue as ValueType | ((prev: ValueType) => ValueType),
      );
      return;
    }

    jotaiSet(
      (stateOrFamily as State<ValueType>).atom,
      valueOrFamilyKey as ValueType | ((prev: ValueType) => ValueType),
    );
  };
