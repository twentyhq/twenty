import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const apiKeyTokenFamilyState = createFamilyState<string | null, string>({
  key: 'apiKeyTokenState',
  defaultValue: null,
});
