import { atom } from 'recoil';

export const isDevelopersSettingsEnabledState = atom<boolean>({
  key: 'isDevelopersSettingsEnabledState',
  default: false,
});
