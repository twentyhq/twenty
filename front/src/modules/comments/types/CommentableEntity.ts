import { CommentableType } from '~/generated/graphql';

export type CommentableEntity = {
  type: CommentableType;
  id: string;
};
