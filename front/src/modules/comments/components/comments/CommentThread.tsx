import styled from '@emotion/styled';

import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';

import { CommentTextInput } from './CommentTextInput';
import { CommentThreadItem } from './CommentThreadItem';

type OwnProps = {
  commentThread: CommentThreadForDrawer;
};

const StyledContainer = styled.div`
  display: flex;
  align-items: flex-start;

  flex-direction: column;

  justify-content: flex-start;

  gap: ${(props) => props.theme.spacing(4)};
  padding: ${(props) => props.theme.spacing(2)};
`;

export function CommentThread({ commentThread }: OwnProps) {
  function handleSendComment(text: string) {
    console.log(text);
  }

  return (
    <StyledContainer>
      {commentThread.comments?.map((comment) => (
        <CommentThreadItem key={comment.id} comment={comment} />
      ))}
      <CommentTextInput onSend={handleSendComment} />
    </StyledContainer>
  );
}
