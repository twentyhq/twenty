import styled from '@emotion/styled';

import { CardContent } from '@/ui/layout/card/components/CardContent';
import { Avatar } from '@/users/components/Avatar';
import { TimelineThread } from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils';

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(12)};
  padding: ${({ theme }) => theme.spacing(0, 4)};
  cursor: pointer;
`;

const StyledHeading = styled.div<{ unread: boolean }>`
  align-items: center;
  color: ${({ theme, unread }) =>
    unread ? theme.font.color.primary : theme.font.color.secondary};
  display: flex;
  font-weight: ${({ theme, unread }) =>
    unread ? theme.font.weight.medium : theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
  width: 160px;

  :before {
    background-color: ${({ theme, unread }) =>
      unread ? theme.color.blue : 'transparent'};
    border-radius: ${({ theme }) => theme.border.radius.rounded};
    content: '';
    display: block;
    height: 6px;
    width: 6px;
  }
`;

const StyledAvatar = styled(Avatar)`
  margin: ${({ theme }) => theme.spacing(0, 1)};
`;

const StyledSenderName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledThreadCount = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledSubject = styled.span<{ unread: boolean }>`
  color: ${({ theme, unread }) =>
    unread ? theme.font.color.primary : theme.font.color.secondary};
  white-space: nowrap;
`;

const StyledBody = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSubjectAndBody = styled.div`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledReceivedAt = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding: ${({ theme }) => theme.spacing(0, 1)};
`;

type EmailThreadPreviewProps = {
  divider?: boolean;
  thread: TimelineThread;
  onClick: () => void;
};

export const EmailThreadPreview = ({
  divider,
  thread,
  onClick,
}: EmailThreadPreviewProps) => {
  return (
    <StyledCardContent onClick={() => onClick()} divider={divider}>
      <StyledHeading unread={!thread.read}>
        <StyledAvatar
          avatarUrl={thread.firstParticipant.avatarUrl}
          placeholder={thread.firstParticipant.displayName}
          type="rounded"
        />
        <StyledSenderName>
          {thread.firstParticipant.displayName}
        </StyledSenderName>
        <StyledThreadCount>{thread.numberOfMessagesInThread}</StyledThreadCount>
      </StyledHeading>

      <StyledSubjectAndBody>
        <StyledSubject unread={!thread.read}>{thread.subject}</StyledSubject>
        <StyledBody>{thread.lastMessageBody}</StyledBody>
      </StyledSubjectAndBody>
      <StyledReceivedAt>
        {formatToHumanReadableDate(thread.lastMessageReceivedAt)}
      </StyledReceivedAt>
    </StyledCardContent>
  );
};
