import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, RecoilState } from 'recoil';

import { generatedApiKeyFamilyState } from '@/settings/developers/states/generatedApiKeyFamilyState';

import { useGeneratedApiKeys } from '../useGeneratedApiKeys';

describe('useGeneratedApiKeys', () => {
  test('should set generatedApiKeyFamilyState correctly', () => {
    const { result } = renderHook(() => useGeneratedApiKeys(), {
      wrapper: RecoilRoot,
    });

    const apiKeyId = 'someId';
    const apiKey = 'someKey';

    act(() => {
      result.current(apiKeyId, apiKey);
    });

    const recoilState: RecoilState<string | null | undefined> =
      generatedApiKeyFamilyState(apiKeyId);

    const stateValue = recoilState.key;
    expect(stateValue).toContain(apiKeyId);
  });
});
