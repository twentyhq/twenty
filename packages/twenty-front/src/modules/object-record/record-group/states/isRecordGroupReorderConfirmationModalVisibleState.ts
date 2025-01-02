import { atom } from 'recoil';

export const isRecordGroupReorderConfirmationModalVisibleState = atom<boolean>({
  key: 'isRecordGroupReorderConfirmationModalVisibleState',
  default: false,
});
