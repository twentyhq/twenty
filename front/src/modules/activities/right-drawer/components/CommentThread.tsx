import { CommentThreadEditor } from '@/activities/components/CommentThreadEditor';
import { useGetCommentThreadQuery } from '~/generated/graphql';

import '@blocknote/core/style.css';

type OwnProps = {
  commentThreadId: string;
  showComment?: boolean;
  autoFillTitle?: boolean;
};

export function CommentThread({
  commentThreadId,
  showComment = true,
  autoFillTitle = false,
}: OwnProps) {
  const { data } = useGetCommentThreadQuery({
    variables: {
      commentThreadId: commentThreadId ?? '',
    },
    skip: !commentThreadId,
  });
  const commentThread = data?.findManyCommentThreads[0];

  return commentThread ? (
    <CommentThreadEditor
      commentThread={commentThread}
      showComment={showComment}
      autoFillTitle={autoFillTitle}
    />
  ) : (
    <></>
  );
}
