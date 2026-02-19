import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const isNavigationSectionOpenFamilyState = createFamilyStateV2<
  boolean,
  string
>({
  key: 'isNavigationSectionOpenFamilyState',
  defaultValue: true,
  useLocalStorage: true,
});
