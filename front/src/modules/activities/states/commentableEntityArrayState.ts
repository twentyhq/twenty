import { atom } from 'recoil';

import { CommentableEntity } from '../types/CommentableEntity';

export const commentableEntityArrayState = atom<CommentableEntity[]>({
  key: 'activities/commentable-entity-array',
  default: [],
});
