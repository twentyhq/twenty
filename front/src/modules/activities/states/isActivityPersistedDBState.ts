import { atom } from 'recoil';

export const isActivityPersistedDBState = atom<boolean>({
  key: 'activities/is-activity-persisted-db',
  default: false,
});
