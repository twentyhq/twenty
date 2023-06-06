import styled from '@emotion/styled';

import { CommentForDrawer } from '@/comments/types/CommentForDrawer';

import { CommentHeader } from './CommentHeader';

type OwnProps = {
  comment: CommentForDrawer;
};

const StyledContainer = styled.div`
  display: flex;
  align-items: flex-start;

  flex-direction: column;

  justify-content: flex-start;

  gap: ${(props) => props.theme.spacing(1)};
`;

const StyledCommentBody = styled.div`
  font-size: 13px;
  font-weight: 400;
  line-height: 19.5px;
  letter-spacing: 0em;
  text-align: left;
  padding-left: 24px;

  color: ${(props) => props.theme.text60};
`;

export function CommentThreadItem({ comment }: OwnProps) {
  return (
    <StyledContainer>
      <CommentHeader
        avatarUrl={comment.author.avatarUrl}
        username={comment.author.displayName}
        createdAt={comment.createdAt}
      />
      <StyledCommentBody>{comment.body}</StyledCommentBody>
    </StyledContainer>
  );
}
