import { type Getter } from 'jotai';

import { type FamilySelectorV2 } from '@/ui/utilities/state/jotai/types/FamilySelectorV2';
import { type FamilyStateV2 } from '@/ui/utilities/state/jotai/types/FamilyStateV2';
import { type SelectorV2 } from '@/ui/utilities/state/jotai/types/SelectorV2';
import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

export const buildGetHelper =
  (jotaiGet: Getter) =>
  <ValueType, FamilyKey = never>(
    stateOrFamily:
      | StateV2<ValueType>
      | SelectorV2<ValueType>
      | FamilyStateV2<ValueType, FamilyKey>
      | FamilySelectorV2<ValueType, FamilyKey>,
    familyKey?: FamilyKey,
  ): ValueType => {
    if (stateOrFamily.type === 'FamilyStateV2') {
      return jotaiGet(
        (stateOrFamily as FamilyStateV2<ValueType, FamilyKey>).atomFamily(
          familyKey as FamilyKey,
        ),
      );
    }

    if (stateOrFamily.type === 'FamilySelectorV2') {
      return jotaiGet(
        (
          stateOrFamily as FamilySelectorV2<ValueType, FamilyKey>
        ).selectorFamily(familyKey as FamilyKey),
      );
    }

    return jotaiGet(
      (stateOrFamily as StateV2<ValueType> | SelectorV2<ValueType>).atom,
    );
  };
