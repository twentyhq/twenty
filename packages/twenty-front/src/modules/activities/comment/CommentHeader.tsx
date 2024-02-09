import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';

import { Comment } from '@/activities/types/Comment';
import { Avatar } from '@/users/components/Avatar';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;

  justify-content: space-between;

  padding: ${({ theme }) => theme.spacing(1)};
  width: calc(100% - ${({ theme }) => theme.spacing(1)});
`;

const StyledLeftContainer = styled.div`
  align-items: end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDate = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledTooltip = styled(Tooltip)`
  background-color: ${({ theme }) => theme.background.primary};

  box-shadow: 0px 2px 4px 3px
    ${({ theme }) => theme.background.transparent.light};

  box-shadow: 2px 4px 16px 6px
    ${({ theme }) => theme.background.transparent.light};

  color: ${({ theme }) => theme.font.color.primary};

  opacity: 1;
  padding: 8px;
`;

type CommentHeaderProps = {
  comment: Pick<Comment, 'id' | 'author' | 'createdAt'>;
  actionBar?: React.ReactNode;
};

export const CommentHeader = ({ comment, actionBar }: CommentHeaderProps) => {
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(comment.createdAt);
  const exactCreatedAt = beautifyExactDateTime(comment.createdAt);
  const showDate = beautifiedCreatedAt !== '';

  const author = comment.author;
  const authorName = author?.name?.firstName + ' ' + author?.name?.lastName;
  const avatarUrl = author?.avatarUrl;
  const commentId = comment.id;

  return (
    <StyledContainer>
      <StyledLeftContainer>
        <Avatar
          avatarUrl={avatarUrl}
          size="md"
          entityId={author?.id}
          placeholder={authorName}
        />
        <StyledName>{authorName}</StyledName>
        {showDate && (
          <>
            <StyledDate id={`id-${commentId}`}>
              {beautifiedCreatedAt}
            </StyledDate>
            <StyledTooltip
              anchorSelect={`#id-${commentId}`}
              content={exactCreatedAt}
              clickable
              noArrow
            />
          </>
        )}
      </StyledLeftContainer>
      <div>{actionBar}</div>
    </StyledContainer>
  );
};
