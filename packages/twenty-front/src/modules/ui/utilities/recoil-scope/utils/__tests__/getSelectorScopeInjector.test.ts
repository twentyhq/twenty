import { renderHook } from '@testing-library/react';
import { atomFamily, RecoilRoot, selector, useRecoilValue } from 'recoil';

import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';

import { getSelectorScopeInjector } from '../getSelectorScopeInjector';

const scopedState = atomFamily<
  number[],
  {
    scopeId: string;
  }
>({
  key: 'myStateKey',
  default: [1, 2, 3, 4, 5],
});

const scopedSelector = ({ scopeId }: StateScopeMapKey) =>
  selector({
    key: 'FilteredState',
    get: ({ get }) => {
      const scopedStateValue = get(scopedState({ scopeId }));
      return scopedStateValue.filter((value) => value % 2 === 0);
    },
  });

describe('getSelectorScopeInjector', () => {
  it('should return a valid SelectorScopeInjector', () => {
    const selectorScopeInjector = getSelectorScopeInjector(scopedSelector);
    const recoilValue = selectorScopeInjector('scopeId');

    const { result } = renderHook(() => useRecoilValue(recoilValue), {
      wrapper: RecoilRoot,
    });

    expect(result.current).toEqual([2, 4]);
  });
});
