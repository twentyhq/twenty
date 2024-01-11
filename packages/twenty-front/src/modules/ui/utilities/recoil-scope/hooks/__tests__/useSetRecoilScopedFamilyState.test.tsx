import { act, renderHook } from '@testing-library/react';
import { atomFamily, RecoilRoot } from 'recoil';

import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';
import { useSetRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useSetRecoilScopedFamilyState';
import { FamilyStateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/FamilyStateScopeMapKey';

const mockedScopedFamilyState = atomFamily<
  string,
  FamilyStateScopeMapKey<string>
>({
  key: 'scopedAtomKey',
  default: 'initialValue',
});

describe('useSetRecoilScopedFamilyState', () => {
  const mockedScopeId = 'mocked-scope-id';
  const mockedFamilyKey = 'test-key-value';

  it('Should return a setter that updates the state value and work properly', async () => {
    const useCombinedHooks = () => {
      const setRecoilScopedFamilyState = useSetRecoilScopedFamilyState(
        mockedScopedFamilyState,
        mockedScopeId,
        mockedFamilyKey,
      );

      const [mocked] = useRecoilScopedFamilyState(
        mockedScopedFamilyState,
        mockedScopeId,
        mockedFamilyKey,
      );

      return {
        setRecoilScopedFamilyState,
        scopedFamilyState: mocked,
      };
    };

    const { result } = renderHook(() => useCombinedHooks(), {
      wrapper: RecoilRoot,
    });

    expect(result.current.scopedFamilyState).toBe('initialValue');
    expect(result.current.setRecoilScopedFamilyState).toBeInstanceOf(Function);

    await act(async () => {
      result.current.setRecoilScopedFamilyState?.('testValue');
    });

    expect(result.current.scopedFamilyState).toBe('testValue');
  });

  it('Should return undefined when familyKey is missing', async () => {
    const useCombinedHooks = () => {
      const setRecoilScopedFamilyState = useSetRecoilScopedFamilyState(
        mockedScopedFamilyState,
        mockedScopeId,
      );

      const [mocked] = useRecoilScopedFamilyState(
        mockedScopedFamilyState,
        mockedScopeId,
      );

      return {
        setRecoilScopedFamilyState,
        scopedFamilyState: mocked,
      };
    };

    const { result } = renderHook(() => useCombinedHooks(), {
      wrapper: RecoilRoot,
    });

    expect(result.current.scopedFamilyState).toBeUndefined();
    expect(result.current.setRecoilScopedFamilyState).toBeUndefined();
  });
});
