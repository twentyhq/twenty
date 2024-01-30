import styled from '@emotion/styled';

import { CardContent } from '@/ui/layout/card/components/CardContent';
import { grayScale } from '@/ui/theme/constants/colors';
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
  display: flex;
  color: ${({ theme, unread }) =>
    unread ? theme.font.color.primary : theme.font.color.secondary};
  font-weight: ${({ theme, unread }) =>
    unread ? theme.font.weight.medium : theme.font.weight.regular};
  overflow: hidden;
  width: 20%;
`;

const StyledParticipantsContainer = styled.div`
  align-items: flex-start;
  display: flex;
`;

const StyledAvatar = styled(Avatar)`
  margin-left: ${({ theme }) => theme.spacing(-1)};
`;

const StyledSenderNames = styled.span`
  display: flex;
  margin: ${({ theme }) => theme.spacing(0, 1)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledThreadCount = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledSubjectAndBody = styled.div`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
`;

const StyledSubject = styled.span<{ unread: boolean }>`
  color: ${({ theme, unread }) =>
    unread ? theme.font.color.primary : theme.font.color.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
`;

const StyledBody = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  const senderNames =
    thread.firstParticipant.displayName +
    (thread?.lastTwoParticipants?.[0]?.displayName
      ? `, ${thread.lastTwoParticipants?.[0]?.displayName}`
      : '') +
    (thread?.lastTwoParticipants?.[1]?.displayName
      ? `, ${thread.lastTwoParticipants?.[1]?.displayName}`
      : '');

  const [finalDisplayedName, finalAvatarUrl, isCountIcon] =
    thread.participantCount > 3
      ? [`${thread.participantCount}`, '', true]
      : [
          thread?.lastTwoParticipants?.[1]?.displayName,
          thread?.lastTwoParticipants?.[1]?.avatarUrl,
          false,
        ];

  return (
    <StyledCardContent onClick={() => onClick()} divider={divider}>
      <StyledHeading unread={!thread.read}>
        <StyledParticipantsContainer>
          <Avatar
            avatarUrl={thread?.firstParticipant?.avatarUrl}
            placeholder={thread.firstParticipant.displayName}
            type="rounded"
          />
          {thread?.lastTwoParticipants?.[0] && (
            <StyledAvatar
              avatarUrl={thread.lastTwoParticipants[0].avatarUrl}
              placeholder={thread.lastTwoParticipants[0].displayName}
              type="rounded"
            />
          )}
          {finalDisplayedName && (
            <StyledAvatar
              avatarUrl={finalAvatarUrl}
              placeholder={finalDisplayedName}
              type="rounded"
              color={isCountIcon ? grayScale.gray50 : undefined}
              backgroundColor={isCountIcon ? grayScale.gray10 : undefined}
            />
          )}
        </StyledParticipantsContainer>

        <StyledSenderNames>{senderNames}</StyledSenderNames>
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
