import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type SettingsBannerParams } from 'twenty-shared/types';

export const settingsBannerFamilyState = createAtomFamilyState<
  SettingsBannerParams | null,
  string
>({
  key: 'settingsBannerFamilyState',
  defaultValue: null,
});
