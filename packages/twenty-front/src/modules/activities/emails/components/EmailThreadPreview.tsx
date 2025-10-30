import styled from '@emotion/styled';

import { ActivityRow } from '@/activities/components/ActivityRow';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { useOpenEmailThreadInCommandMenu } from '@/command-menu/hooks/useOpenEmailThreadInCommandMenu';
import { useTheme } from '@emotion/react';
import { Avatar } from 'twenty-ui/display';
import {
  MessageChannelVisibility,
  type TimelineThread,
} from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';

const StyledHeading = styled.div<{ unread: boolean }>`
  display: flex;
  overflow: hidden;
  width: fit-content;
  max-width: 20%;
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
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
`;

const StyledSubject = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledBody = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const StyledReceivedAt = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding: ${({ theme }) => theme.spacing(0, 1)};
`;

type EmailThreadPreviewProps = {
  thread: TimelineThread;
};

export const EmailThreadPreview = ({ thread }: EmailThreadPreviewProps) => {
  const { openEmailThreadInCommandMenu } = useOpenEmailThreadInCommandMenu();

  const visibility = thread.visibility;

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

  const handleThreadClick = () => {
    const canOpen =
      thread.visibility === MessageChannelVisibility.SHARE_EVERYTHING;

    if (canOpen) {
      openEmailThreadInCommandMenu(thread.id);
    }
  };

  const isDisabled = visibility !== MessageChannelVisibility.SHARE_EVERYTHING;
  const theme = useTheme();

  return (
    <ActivityRow onClick={handleThreadClick} disabled={isDisabled}>
      <StyledHeading unread={!thread.read}>
        <StyledParticipantsContainer>
          <Avatar
            avatarUrl={thread?.firstParticipant?.avatarUrl}
            placeholder={thread.firstParticipant.displayName}
            placeholderColorSeed={
              thread.firstParticipant.workspaceMemberId ||
              thread.firstParticipant.personId
            }
            type="rounded"
          />
          {thread?.lastTwoParticipants?.[0] && (
            <StyledAvatar
              avatarUrl={thread.lastTwoParticipants[0].avatarUrl}
              placeholder={thread.lastTwoParticipants[0].displayName}
              placeholderColorSeed={
                thread.lastTwoParticipants[0].workspaceMemberId ||
                thread.lastTwoParticipants[0].personId
              }
              type="rounded"
            />
          )}
          {finalDisplayedName && (
            <StyledAvatar
              avatarUrl={finalAvatarUrl}
              placeholder={finalDisplayedName}
              type="rounded"
              color={isCountIcon ? theme.grayScale.gray11 : undefined}
              backgroundColor={isCountIcon ? theme.grayScale.gray2 : undefined}
            />
          )}
        </StyledParticipantsContainer>

        <StyledSenderNames>{senderNames}</StyledSenderNames>
        <StyledThreadCount>{thread.numberOfMessagesInThread}</StyledThreadCount>
      </StyledHeading>

      <StyledSubjectAndBody>
        {visibility === MessageChannelVisibility.METADATA && (
          <EmailThreadNotShared visibility={visibility} />
        )}
        {visibility === MessageChannelVisibility.SUBJECT && (
          <>
            <StyledSubject>{thread.subject}</StyledSubject>
            <EmailThreadNotShared visibility={visibility} />
          </>
        )}
        {visibility === MessageChannelVisibility.SHARE_EVERYTHING && (
          <>
            <StyledSubject>{thread.subject}</StyledSubject>
            <StyledBody>{thread.lastMessageBody}</StyledBody>
          </>
        )}
      </StyledSubjectAndBody>
      <StyledReceivedAt>
        {formatToHumanReadableDate(thread.lastMessageReceivedAt)}
      </StyledReceivedAt>
    </ActivityRow>
  );
};
