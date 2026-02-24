import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const apiKeyTokenFamilyState = createFamilyState<string | null, string>({
  key: 'apiKeyTokenState',
  defaultValue: null,
});
