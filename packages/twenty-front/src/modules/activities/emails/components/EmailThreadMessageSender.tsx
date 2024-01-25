import React from 'react';
import styled from '@emotion/styled';

import { Avatar } from '@/users/components/Avatar';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledEmailThreadMessageSender = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledEmailThreadMessageSenderUser = styled.div`
  align-items: flex-start;
  display: flex;
`;

const StyledAvatar = styled(Avatar)`
  margin: ${({ theme }) => theme.spacing(0, 1)};
`;

const StyledSenderName = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledThreadMessageSentAt = styled.div`
  align-items: flex-end;
  display: flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

type EmailThreadMessageSenderProps = {
  displayName: string;
  avatarUrl: string;
  sentAt: string;
};

export const EmailThreadMessageSender = ({
  displayName,
  avatarUrl,
  sentAt,
}: EmailThreadMessageSenderProps) => {
  return (
    <StyledEmailThreadMessageSender>
      <StyledEmailThreadMessageSenderUser>
        <StyledAvatar
          avatarUrl={avatarUrl}
          type="rounded"
          placeholder={displayName}
          size="sm"
        />
        <StyledSenderName>{displayName}</StyledSenderName>
      </StyledEmailThreadMessageSenderUser>
      <StyledThreadMessageSentAt>
        {beautifyPastDateRelativeToNow(sentAt)}
      </StyledThreadMessageSentAt>
    </StyledEmailThreadMessageSender>
  );
};
