import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const commandMenuItemProgressFamilyState = createAtomFamilyState<
  number | undefined,
  string
>({
  key: 'commandMenuItemProgressFamilyState',
  defaultValue: undefined,
});
