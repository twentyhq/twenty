import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const generatedApiKeyFamilyState = createFamilyState<
  string | null | undefined,
  string
>({
  key: 'generatedApiKeyFamilyState',
  defaultValue: null,
});
