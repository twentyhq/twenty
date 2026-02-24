import { type Getter } from 'jotai';

import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import {
  type ComponentFamilyStateKey,
  type ComponentFamilyStateV2,
} from '@/ui/utilities/state/jotai/types/ComponentFamilyStateV2';
import { type ComponentFamilySelectorV2 } from '@/ui/utilities/state/jotai/types/ComponentFamilySelectorV2';
import { type ComponentSelectorV2 } from '@/ui/utilities/state/jotai/types/ComponentSelectorV2';
import { type ComponentStateV2 } from '@/ui/utilities/state/jotai/types/ComponentStateV2';
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
      | FamilySelectorV2<ValueType, FamilyKey>
      | ComponentStateV2<ValueType>
      | ComponentFamilyStateV2<ValueType, FamilyKey>
      | ComponentSelectorV2<ValueType>
      | ComponentFamilySelectorV2<ValueType, FamilyKey>,
    keyOrFamilyKey?:
      | FamilyKey
      | ComponentStateKey
      | ComponentFamilyStateKey<FamilyKey>,
  ): ValueType => {
    if (stateOrFamily.type === 'ComponentStateV2') {
      return jotaiGet(
        (stateOrFamily as ComponentStateV2<ValueType>).atomFamily(
          keyOrFamilyKey as ComponentStateKey,
        ),
      );
    }

    if (stateOrFamily.type === 'ComponentFamilyStateV2') {
      return jotaiGet(
        (
          stateOrFamily as ComponentFamilyStateV2<ValueType, FamilyKey>
        ).atomFamily(keyOrFamilyKey as ComponentFamilyStateKey<FamilyKey>),
      );
    }

    if (stateOrFamily.type === 'ComponentSelectorV2') {
      return jotaiGet(
        (stateOrFamily as ComponentSelectorV2<ValueType>).selectorFamily(
          keyOrFamilyKey as ComponentStateKey,
        ),
      );
    }

    if (stateOrFamily.type === 'ComponentFamilySelectorV2') {
      return jotaiGet(
        (
          stateOrFamily as ComponentFamilySelectorV2<ValueType, FamilyKey>
        ).selectorFamily(keyOrFamilyKey as ComponentFamilyStateKey<FamilyKey>),
      );
    }

    if (stateOrFamily.type === 'FamilyStateV2') {
      return jotaiGet(
        (stateOrFamily as FamilyStateV2<ValueType, FamilyKey>).atomFamily(
          keyOrFamilyKey as FamilyKey,
        ),
      );
    }

    if (stateOrFamily.type === 'FamilySelectorV2') {
      return jotaiGet(
        (
          stateOrFamily as FamilySelectorV2<ValueType, FamilyKey>
        ).selectorFamily(keyOrFamilyKey as FamilyKey),
      );
    }

    return jotaiGet(
      (stateOrFamily as StateV2<ValueType> | SelectorV2<ValueType>).atom,
    );
  };
