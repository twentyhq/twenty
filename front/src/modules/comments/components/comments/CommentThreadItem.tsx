import styled from '@emotion/styled';

import { CommentForDrawer } from '@/comments/types/CommentForDrawer';

import { CommentHeader } from './CommentHeader';

type OwnProps = {
  comment: CommentForDrawer;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: ${(props) => props.theme.spacing(1)};
`;

const StyledCommentBody = styled.div`
  font-size: ${(props) => props.theme.fontSizeMedium};
  line-height: 19.5px;

  text-align: left;
  padding-left: 24px;

  color: ${(props) => props.theme.text60};
`;

export function CommentThreadItem({ comment }: OwnProps) {
  return (
    <StyledContainer>
      <CommentHeader comment={comment} />
      <StyledCommentBody>{comment.body}</StyledCommentBody>
    </StyledContainer>
  );
}
