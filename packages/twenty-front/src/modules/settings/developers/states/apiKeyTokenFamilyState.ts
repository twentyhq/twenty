import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const apiKeyTokenFamilyState = createAtomFamilyState<
  string | null,
  string
>({
  key: 'apiKeyTokenState',
  defaultValue: null,
});
