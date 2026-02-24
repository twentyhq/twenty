import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const isNavigationSectionOpenFamilyState = createFamilyState<
  boolean,
  string
>({
  key: 'isNavigationSectionOpenFamilyState',
  defaultValue: true,
  useLocalStorage: true,
});
