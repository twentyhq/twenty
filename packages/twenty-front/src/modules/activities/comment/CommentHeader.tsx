import styled from '@emotion/styled';
import { AppTooltip, Avatar } from 'twenty-ui';

import { Comment } from '@/activities/types/Comment';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

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
          avatarUrl={getImageAbsoluteURIOrBase64(avatarUrl)}
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
            <AppTooltip
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
