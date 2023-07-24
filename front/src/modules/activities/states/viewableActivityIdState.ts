import { atom } from 'recoil';

export const viewableActivityIdState = atom<string | null>({
  key: 'activities/viewable-comment-thread-id',
  default: null,
});
