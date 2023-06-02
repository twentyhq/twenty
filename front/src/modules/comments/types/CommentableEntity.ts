import { CommentableType } from '../../../generated/graphql';

export type CommentableEntity = {
  type: keyof typeof CommentableType;
  id: string;
};
