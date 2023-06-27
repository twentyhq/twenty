import { Tooltip } from 'react-tooltip';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { CommentForDrawer } from '@/comments/types/CommentForDrawer';
import { Avatar } from '@/users/components/Avatar';
import {
  beautifyExactDate,
  beautifyPastDateRelativeToNow,
} from '@/utils/datetime/date-utils';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';

type OwnProps = {
  comment: Pick<CommentForDrawer, 'id' | 'author' | 'createdAt'>;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;

  flex-direction: row;

  gap: ${({ theme }) => theme.spacing(1)};

  justify-content: flex-start;

  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 13px;
  font-weight: 400;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDate = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: 12px;
  font-weight: 400;

  margin-left: ${({ theme }) => theme.spacing(1)};

  padding-top: 1.5px;
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

export function CommentHeader({ comment }: OwnProps) {
  const theme = useTheme();
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(comment.createdAt);
  const exactCreatedAt = beautifyExactDate(comment.createdAt);
  const showDate = beautifiedCreatedAt !== '';

  const author = comment.author;
  const authorName = author.displayName;
  const avatarUrl = author.avatarUrl;
  const commentId = comment.id;

  const capitalizedFirstUsernameLetter = isNonEmptyString(authorName)
    ? authorName.toLocaleUpperCase()[0]
    : '';

  return (
    <StyledContainer>
      <Avatar
        avatarUrl={avatarUrl}
        size={theme.icon.size.md}
        placeholder={capitalizedFirstUsernameLetter}
      />
      <StyledName>{authorName}</StyledName>
      {showDate && (
        <>
          <StyledDate id={`id-${commentId}`}>{beautifiedCreatedAt}</StyledDate>
          <StyledTooltip
            anchorSelect={`#id-${commentId}`}
            content={exactCreatedAt}
            clickable
            noArrow
          />
        </>
      )}
    </StyledContainer>
  );
}
