import { atomFamily } from 'recoil';

export const generatedApiKeyFamilyState = atomFamily<
  string | null | undefined,
  string
>({
  key: 'generatedApiKeyFamilyState',
  default: null,
});
