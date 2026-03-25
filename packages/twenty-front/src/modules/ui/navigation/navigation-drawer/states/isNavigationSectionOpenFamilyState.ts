import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const isNavigationSectionOpenFamilyState = createAtomFamilyState<
  boolean,
  string
>({
  key: 'isNavigationSectionOpenFamilyState',
  defaultValue: true,
  useLocalStorage: true,
});
