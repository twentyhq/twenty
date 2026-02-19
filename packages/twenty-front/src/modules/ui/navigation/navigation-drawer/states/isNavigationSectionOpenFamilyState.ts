import { createFamilyStateWithLocalStorageV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateWithLocalStorageV2';

export const isNavigationSectionOpenFamilyState =
  createFamilyStateWithLocalStorageV2<boolean, string>({
    key: 'isNavigationSectionOpenFamilyState',
    defaultValue: true,
  });
