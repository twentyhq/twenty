import { atom } from 'recoil';

export const isDataModelSettingsEnabledState = atom<boolean>({
  key: 'isDataModelSettingsEnabledState',
  default: false,
});
