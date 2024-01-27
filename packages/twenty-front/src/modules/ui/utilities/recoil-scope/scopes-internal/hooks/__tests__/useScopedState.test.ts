import { expect } from '@storybook/test';
import { act, renderHook } from '@testing-library/react';
import {
  atomFamily,
  RecoilRoot,
  selector,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';

import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';
import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';
import { getFamilyScopeInjector } from '@/ui/utilities/recoil-scope/utils/getFamilyScopeInjector';
import { getScopeInjector } from '@/ui/utilities/recoil-scope/utils/getScopeInjector';
import { getSelectorScopeInjector } from '@/ui/utilities/recoil-scope/utils/getSelectorScopeInjector';

import { useScopedState } from '../useScopedState';

const scopeId = 'scopeId';

// scoped state
const defaultScopedState = 'defaultString';
const scopedState = atomFamily<string, StateScopeMapKey>({
  key: 'ScopedStateKey',
  default: defaultScopedState,
});
const scopedStateScopeInjector = getScopeInjector(scopedState);

// scoped selector
const anotherScopedState = atomFamily<number[], StateScopeMapKey>({
  key: 'ScopedStateKey',
  default: [1, 2, 3, 4, 5],
});
const scopedSelector = ({ scopeId }: StateScopeMapKey) =>
  selector({
    key: 'FilteredState',
    get: ({ get }) => {
      const scopedStateValue = get(anotherScopedState({ scopeId }));
      return scopedStateValue.filter((value) => value % 2 === 0);
    },
  });
const selectorScopeInjector = getSelectorScopeInjector(scopedSelector);

// family state
const defaultValue = 'defaultString';
const scopedFamilyState = createFamilyStateScopeMap<string, string>({
  key: 'FamilyStateKey',
  defaultValue,
});
const familyScopeInjector = getFamilyScopeInjector(scopedFamilyState);

describe('useScopedState', () => {
  it('should get scoped state', () => {
    const {
      result: {
        current: { getScopedState },
      },
    } = renderHook(() => useScopedState(scopeId));

    const scopedState = getScopedState(scopedStateScopeInjector);

    const { result } = renderHook(
      () => {
        const [scoped, setScoped] = useRecoilState(scopedState);
        return { scoped, setScoped };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    expect(result.current.scoped).toBe(defaultScopedState);

    const newValue = 'anotherValue';

    act(() => {
      result.current.setScoped(newValue);
    });

    expect(result.current.scoped).toBe(newValue);
  });

  it('should get scoped snapshot value', () => {
    const {
      result: {
        current: { getScopedSnapshotValue },
      },
    } = renderHook(() => useScopedState(scopeId));

    const { result } = renderHook(
      () =>
        useRecoilCallback(
          ({ snapshot }) =>
            () =>
              getScopedSnapshotValue(snapshot, scopedStateScopeInjector),
        )(),
      { wrapper: RecoilRoot },
    );

    expect(result.current).toBe(defaultScopedState);
  });

  it('should get scoped selector', () => {
    const {
      result: {
        current: { getScopedSelector },
      },
    } = renderHook(() => useScopedState(scopeId));

    const recoilValue = getScopedSelector(selectorScopeInjector);

    const { result } = renderHook(() => useRecoilValue(recoilValue), {
      wrapper: RecoilRoot,
    });

    expect(result.current).toEqual([2, 4]);
  });

  it('should get scoped selector snapshot value', () => {
    const {
      result: {
        current: { getScopedSelectorSnapshotValue },
      },
    } = renderHook(() => useScopedState(scopeId));

    const { result } = renderHook(
      () =>
        useRecoilCallback(
          ({ snapshot }) =>
            () =>
              getScopedSelectorSnapshotValue(snapshot, selectorScopeInjector),
        )(),
      { wrapper: RecoilRoot },
    );

    expect(result.current).toEqual([2, 4]);
  });

  it('should get scoped family state', () => {
    const {
      result: {
        current: { getScopedFamilyState },
      },
    } = renderHook(() => useScopedState(scopeId));

    const scopedFamilyState = getScopedFamilyState(familyScopeInjector);

    const { result } = renderHook(
      () => {
        const [familyState, setFamilyState] = useRecoilState(
          scopedFamilyState('familyKey'),
        );

        return { familyState, setFamilyState };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    expect(result.current.familyState).toBe('defaultString');

    const newValue = 'newValue';

    act(() => {
      result.current.setFamilyState(newValue);
    });

    expect(result.current.familyState).toBe(newValue);
  });

  it('should get scoped family snapshot value', () => {
    const {
      result: {
        current: { getScopedFamilySnapshotValue },
      },
    } = renderHook(() => useScopedState(scopeId));

    const { result } = renderHook(
      () =>
        useRecoilCallback(
          ({ snapshot }) =>
            () =>
              getScopedFamilySnapshotValue(snapshot, familyScopeInjector),
        )(),
      { wrapper: RecoilRoot },
    );

    expect(result.current('sampleKey')).toBe('defaultString');
  });
});
