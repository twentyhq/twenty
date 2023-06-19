import { CommentableType } from '~/generated/graphql';

export type CommentableEntity = {
  id: string;
  type: CommentableType;
};
