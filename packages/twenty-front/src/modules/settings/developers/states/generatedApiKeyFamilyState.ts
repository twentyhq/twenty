import { createFamilyState } from 'twenty-ui';

export const generatedApiKeyFamilyState = createFamilyState<
  string | null | undefined,
  string
>({
  key: 'generatedApiKeyFamilyState',
  defaultValue: null,
});
