import { atom } from 'recoil';

export const viewableCommentThreadIdState = atom<string | null>({
  key: 'comments/viewable-comment-thread-id',
  default: null,
});
