import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { localStorageEffect } from '~/utils/recoil-effects';

export const isNavigationSectionOpenFamilytState = createFamilyState<
  boolean,
  string
>({
  key: 'isNavigationSectionOpenFamilytState',
  defaultValue: true,
  effects: [localStorageEffect()],
});
