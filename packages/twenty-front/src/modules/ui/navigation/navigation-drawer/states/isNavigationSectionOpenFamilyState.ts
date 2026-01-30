import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { localStorageEffect } from '~/utils/recoil/localStorageEffect';

export const isNavigationSectionOpenFamilyState = createFamilyState<
  boolean,
  string
>({
  key: 'isNavigationSectionOpenFamilyState',
  defaultValue: true,
  effects: [localStorageEffect()],
});
