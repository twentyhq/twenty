import { act, renderHook } from '@testing-library/react';
import { atomFamily, RecoilRoot } from 'recoil';

import { useRecoilScopedValueV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValueV2';
import { useSetRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useSetRecoilScopedStateV2';
import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';

const scopedAtom = atomFamily<string, StateScopeMapKey>({
  key: 'scopedAtomKey',
  default: 'initialValue',
});

describe('useSetRecoilScopedStateV2', () => {
  const mockedScopeId = 'mocked-scope-id';

  it('Should return a setter that updates the state value', async () => {
    const useCombinedHooks = () => {
      const setRecoilScopedStateV2 = useSetRecoilScopedStateV2(
        scopedAtom,
        mockedScopeId,
      );

      const recoilScopedStateValue = useRecoilScopedValueV2(
        scopedAtom,
        mockedScopeId,
      );

      return {
        setRecoilScopedStateV2,
        recoilScopedStateValue,
      };
    };

    const { result } = renderHook(() => useCombinedHooks(), {
      wrapper: RecoilRoot,
    });

    expect(result.current.recoilScopedStateValue).toBe('initialValue');
    expect(result.current.setRecoilScopedStateV2).toBeInstanceOf(Function);

    await act(async () => {
      result.current.setRecoilScopedStateV2('testValue');
    });

    expect(result.current.recoilScopedStateValue).toBe('testValue');
  });
});
