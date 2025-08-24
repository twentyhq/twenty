import { atom } from 'recoil';

export const otpProvisioningInProgressState = atom<boolean>({
  key: 'otpProvisioningInProgress',
  default: false,
});
