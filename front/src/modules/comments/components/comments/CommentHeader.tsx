import { Tooltip } from 'react-tooltip';
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

  gap: ${(props) => props.theme.spacing(1)};

  justify-content: flex-start;

  padding: ${(props) => props.theme.spacing(1)};
`;

const StyledName = styled.div`
  color: ${(props) => props.theme.text80};
  font-size: 13px;
  font-weight: 400;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDate = styled.div`
  color: ${(props) => props.theme.text30};
  font-size: 12px;
  font-weight: 400;

  margin-left: ${(props) => props.theme.spacing(1)};

  padding-top: 1.5px;
`;

const StyledTooltip = styled(Tooltip)`
  background-color: ${(props) => props.theme.primaryBackground};

  box-shadow: 0px 2px 4px 3px
    ${(props) => props.theme.lightBackgroundTransparent};

  box-shadow: 2px 4px 16px 6px
    ${(props) => props.theme.lightBackgroundTransparent};

  color: ${(props) => props.theme.text100};

  opacity: 1;
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
      <Avatar
        avatarUrl={avatarUrl}
        size={16}
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
