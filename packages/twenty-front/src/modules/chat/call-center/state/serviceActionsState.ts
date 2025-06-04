import { atom } from 'recoil';

export type ServiceActions = {
  startService: () => void;
  finalizeService: () => void;
  holdService: () => void;
};

export const serviceActionsState = atom<ServiceActions | null>({
  key: 'serviceActionsState',
  default: null,
});
