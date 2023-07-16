import { CommentThreadForDrawer } from './CommentThreadForDrawer';

export type CommentForDrawer = NonNullable<
  CommentThreadForDrawer['comments']
>[0];
