import React from 'react';
import styled from '@emotion/styled';

import { Avatar } from '@/users/components/Avatar';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledMessageThreadSender = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledMessageThreadSenderUser = styled.div`
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

const StyledMessageThreadSentAt = styled.div`
  align-items: flex-end;
  display: flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

type MessageThreadSenderProps = {
  displayName: string;
  avatarUrl: string;
  sentAt: string;
};

export const MessageThreadSender = ({
  displayName,
  avatarUrl,
  sentAt,
}: MessageThreadSenderProps) => {
  return (
    <StyledMessageThreadSender>
      <StyledMessageThreadSenderUser>
        <StyledAvatar
          avatarUrl={avatarUrl}
          type="rounded"
          placeholder={displayName}
          size="sm"
        />
        <StyledSenderName>{displayName}</StyledSenderName>
      </StyledMessageThreadSenderUser>
      <StyledMessageThreadSentAt>
        {beautifyPastDateRelativeToNow(sentAt)}
      </StyledMessageThreadSentAt>
    </StyledMessageThreadSender>
  );
};
