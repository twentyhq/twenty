import styled from '@emotion/styled';

import { CommentForDrawer } from '@/comments/types/CommentForDrawer';

import { CommentHeader } from './CommentHeader';

type OwnProps = {
  comment: CommentForDrawer;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(1)};
  justify-content: flex-start;
`;

const StyledCommentBody = styled.div`
  color: ${(props) => props.theme.text60};
  font-size: ${(props) => props.theme.fontSizeMedium};

  line-height: ${(props) => props.theme.lineHeight};
  overflow-wrap: anywhere;

  padding-left: 24px;

  text-align: left;
`;

export function CommentThreadItem({ comment }: OwnProps) {
  return (
    <StyledContainer>
      <CommentHeader comment={comment} />
      <StyledCommentBody>{comment.body}</StyledCommentBody>
    </StyledContainer>
  );
}
