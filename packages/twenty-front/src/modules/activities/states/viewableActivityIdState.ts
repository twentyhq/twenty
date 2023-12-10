import { atom } from 'recoil';

export const viewableActivityIdState = atom<string | null>({
  key: 'activities/viewable-activity-id',
  default: null,
});
