import styled from '@emotion/styled';
import { type ReactElement } from 'react';

import { CommentTile } from '@/activities/comments/components/CommentTile';
import { type Comment } from '@/activities/comments/types/Comment';

type CommentListProps = {
  title: string;
  comments: Comment[];
  button?: ReactElement | false | null;
  totalCount: number;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledTitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledCommentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const CommentList = ({
  title,
  comments,
  totalCount,
  button,
}: CommentListProps) => (
  <>
    {comments && comments.length > 0 && (
      <StyledContainer>
        <StyledTitleBar>
          <StyledTitle>
            {title} <StyledCount>{totalCount}</StyledCount>
          </StyledTitle>
          {button}
        </StyledTitleBar>
        <StyledCommentContainer>
          {comments.map((comment) => (
            <CommentTile key={comment.id} comment={comment} />
          ))}
        </StyledCommentContainer>
      </StyledContainer>
    )}
  </>
);
