import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, RecoilState } from 'recoil';
import { undefined } from 'zod';

import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';
import { FamilyStateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/FamilyStateScopeMapKey';
import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

const testState = createFamilyStateScopeMap({
  key: 'sampleKey',
  defaultValue: 'defaultValue',
});

describe('useRecoilScopedFamilyState', () => {
  it('Should work as expected', async () => {
    const { result, rerender } = renderHook(
      ({
        recoilState,
        scopeId,
        familyKey,
      }: {
        recoilState: (
          scopedFamilyKey: FamilyStateScopeMapKey<string>,
        ) => RecoilState<string>;
        scopeId: string;
        familyKey?: string;
      }) => useRecoilScopedFamilyState(recoilState, scopeId, familyKey),
      {
        wrapper: RecoilRoot,
        initialProps: {
          recoilState: testState,
          scopeId: 'scopeId',
        },
      },
    );

    expect(result.current).toEqual([undefined, undefined]);

    rerender({
      recoilState: testState,
      scopeId: 'scopeId',
      familyKey: 'familyKey',
    });

    const [value, setValue] = result.current;

    expect(value).toBe('defaultValue');
    expect(setValue).toBeInstanceOf(Function);

    act(() => {
      setValue?.('newValue');
    });

    expect(result.current[0]).toBe('newValue');

    rerender({
      recoilState: testState,
      scopeId: 'scopeId1',
      familyKey: 'familyKey',
    });

    expect(result.current[0]).toBe('defaultValue');
  });
});
