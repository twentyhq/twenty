import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';

import { CommentTextInput } from './CommentTextInput';

type OwnProps = {
  commentThread: CommentThreadForDrawer;
};

export function CommentThread({ commentThread }: OwnProps) {
  function handleSendComment(text: string) {
    console.log(text);
  }

  return (
    <div>
      {commentThread.comments?.map((comment) => (
        <div key={comment.id}>
          <div>
            {comment.author?.displayName} - {comment.createdAt}
          </div>
          <div>{comment.body}</div>
        </div>
      ))}
      <CommentTextInput onSend={handleSendComment} />
    </div>
  );
}
