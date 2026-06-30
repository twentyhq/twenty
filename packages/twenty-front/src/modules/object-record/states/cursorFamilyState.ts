import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const cursorFamilyState = createAtomFamilyState<
  string,
  string | undefined
>({
  key: 'cursorFamilyState',
  defaultValue: '',
});
