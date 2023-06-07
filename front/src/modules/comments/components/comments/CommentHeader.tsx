import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';

import { CommentForDrawer } from '@/comments/types/CommentForDrawer';
import { UserAvatar } from '@/users/components/UserAvatar';
import {
  beautifyExactDate,
  beautifyPastDateRelativeToNow,
} from '@/utils/datetime/date-utils';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';

type OwnProps = {
  comment: Pick<CommentForDrawer, 'id' | 'author' | 'createdAt'>;
};

const StyledContainer = styled.div`
  display: flex;
  align-items: center;

  flex-direction: row;

  justify-content: flex-start;

  padding: ${(props) => props.theme.spacing(1)};

  gap: ${(props) => props.theme.spacing(1)};
`;

const StyledName = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: ${(props) => props.theme.text80};
`;

const StyledDate = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${(props) => props.theme.text30};

  padding-top: 1.5px;

  margin-left: ${(props) => props.theme.spacing(1)};
`;

const StyledTooltip = styled(Tooltip)`
  padding: 8px;
`;

export function CommentHeader({ comment }: OwnProps) {
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
      <UserAvatar
        avatarUrl={avatarUrl}
        size={16}
        placeholderLetter={capitalizedFirstUsernameLetter}
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
