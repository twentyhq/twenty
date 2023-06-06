import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';

import { UserAvatar } from '@/users/components/UserAvatar';
import {
  beautifyExactDate,
  beautifyPastDateRelativeToNow,
} from '@/utils/datetime/date-utils';

type OwnProps = {
  avatarUrl: string | null | undefined;
  username: string;
  createdAt: Date;
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

export function CommentHeader({ avatarUrl, username, createdAt }: OwnProps) {
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(createdAt);
  const exactCreatedAt = beautifyExactDate(createdAt);
  const showDate = beautifiedCreatedAt !== '';

  const capitalizedFirstUsernameLetter =
    username !== '' ? username.toLocaleUpperCase()[0] : '';

  return (
    <StyledContainer>
      <UserAvatar
        avatarUrl={avatarUrl}
        size={16}
        placeholderLetter={capitalizedFirstUsernameLetter}
      />
      <StyledName>{username}</StyledName>
      {showDate && (
        <>
          <StyledDate className="comment-created-at">
            {beautifiedCreatedAt}
          </StyledDate>
          <StyledTooltip
            anchorSelect=".comment-created-at"
            content={exactCreatedAt}
            clickable
            noArrow
          />
        </>
      )}
    </StyledContainer>
  );
}
