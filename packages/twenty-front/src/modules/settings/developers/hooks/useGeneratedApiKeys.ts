import { useRecoilCallback } from 'recoil';

import { generatedApiKeyFamilyState } from '@/settings/developers/states/generatedApiKeyFamilyState';

export const useGeneratedApiKeys = () => {
  return useRecoilCallback(
    ({ set }) =>
      (apiKeyId: string, apiKey: string | null) => {
        set(generatedApiKeyFamilyState(apiKeyId), apiKey);
      },
    [],
  );
};
