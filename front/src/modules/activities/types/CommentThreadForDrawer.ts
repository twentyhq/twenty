import { GetCommentThreadsByTargetsQuery } from '~/generated/graphql';

export type CommentThreadForDrawer =
  GetCommentThreadsByTargetsQuery['findManyCommentThreads'][0];
