import { renderHook } from '@testing-library/react';
import { atomFamily, RecoilRoot } from 'recoil';

import { useRecoilScopedValueV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValueV2';
import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';

const scopedAtom = atomFamily<string, StateScopeMapKey>({
  key: 'scopedAtomKey',
  default: 'initialValue',
});

describe('useRecoilScopedValueV2', () => {
  const mockedScopeId = 'mocked-scope-id';

  it('Should return the scoped value using useRecoilScopedValueV2', () => {
    const { result } = renderHook(
      () => useRecoilScopedValueV2(scopedAtom, mockedScopeId),
      {
        wrapper: RecoilRoot,
      },
    );

    const scopedValue = result.current;

    expect(scopedValue).toBe('initialValue');
  });
});
