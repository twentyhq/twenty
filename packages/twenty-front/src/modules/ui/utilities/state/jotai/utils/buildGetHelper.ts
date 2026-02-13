import { type Getter } from 'jotai';

import { type FamilyStateV2 } from '@/ui/utilities/state/jotai/types/FamilyStateV2';
import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

export const buildGetHelper =
  (jotaiGet: Getter) =>
  <ValueType, FamilyKey = never>(
    stateOrFamily: StateV2<ValueType> | FamilyStateV2<ValueType, FamilyKey>,
    familyKey?: FamilyKey,
  ): ValueType => {
    if (stateOrFamily.type === 'FamilyStateV2') {
      return jotaiGet(
        (stateOrFamily as FamilyStateV2<ValueType, FamilyKey>).atomFamily(
          familyKey as FamilyKey,
        ),
      );
    }

    return jotaiGet((stateOrFamily as StateV2<ValueType>).atom);
  };
