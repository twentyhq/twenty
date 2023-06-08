import { atom } from 'recoil';

export const createdCommentThreadIdState = atom<string | null>({
  key: 'comments/created-comment-thread-id',
  default: null,
});
