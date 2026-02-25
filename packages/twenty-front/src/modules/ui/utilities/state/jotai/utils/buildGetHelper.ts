import { type Getter } from 'jotai';

import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import {
  type ComponentFamilyStateKey,
  type ComponentFamilyState,
} from '@/ui/utilities/state/jotai/types/ComponentFamilyState';
import { type ComponentFamilySelector } from '@/ui/utilities/state/jotai/types/ComponentFamilySelector';
import { type ComponentSelector } from '@/ui/utilities/state/jotai/types/ComponentSelector';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { type FamilySelector } from '@/ui/utilities/state/jotai/types/FamilySelector';
import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';
import { type Selector } from '@/ui/utilities/state/jotai/types/Selector';
import { type State } from '@/ui/utilities/state/jotai/types/State';

export const buildGetHelper =
  (jotaiGet: Getter) =>
  <ValueType, FamilyKey = never>(
    stateOrFamily:
      | State<ValueType>
      | Selector<ValueType>
      | FamilyState<ValueType, FamilyKey>
      | FamilySelector<ValueType, FamilyKey>
      | ComponentState<ValueType>
      | ComponentFamilyState<ValueType, FamilyKey>
      | ComponentSelector<ValueType>
      | ComponentFamilySelector<ValueType, FamilyKey>,
    keyOrFamilyKey?:
      | FamilyKey
      | ComponentStateKey
      | ComponentFamilyStateKey<FamilyKey>,
  ): ValueType => {
    if (stateOrFamily.type === 'ComponentState') {
      return jotaiGet(
        (stateOrFamily as ComponentState<ValueType>).atomFamily(
          keyOrFamilyKey as ComponentStateKey,
        ),
      );
    }

    if (stateOrFamily.type === 'ComponentFamilyState') {
      return jotaiGet(
        (
          stateOrFamily as ComponentFamilyState<ValueType, FamilyKey>
        ).atomFamily(keyOrFamilyKey as ComponentFamilyStateKey<FamilyKey>),
      );
    }

    if (stateOrFamily.type === 'ComponentSelector') {
      return jotaiGet(
        (stateOrFamily as ComponentSelector<ValueType>).selectorFamily(
          keyOrFamilyKey as ComponentStateKey,
        ),
      );
    }

    if (stateOrFamily.type === 'ComponentFamilySelector') {
      return jotaiGet(
        (
          stateOrFamily as ComponentFamilySelector<ValueType, FamilyKey>
        ).selectorFamily(keyOrFamilyKey as ComponentFamilyStateKey<FamilyKey>),
      );
    }

    if (stateOrFamily.type === 'FamilyState') {
      return jotaiGet(
        (stateOrFamily as FamilyState<ValueType, FamilyKey>).atomFamily(
          keyOrFamilyKey as FamilyKey,
        ),
      );
    }

    if (stateOrFamily.type === 'FamilySelector') {
      return jotaiGet(
        (stateOrFamily as FamilySelector<ValueType, FamilyKey>).selectorFamily(
          keyOrFamilyKey as FamilyKey,
        ),
      );
    }

    return jotaiGet(
      (stateOrFamily as State<ValueType> | Selector<ValueType>).atom,
    );
  };
