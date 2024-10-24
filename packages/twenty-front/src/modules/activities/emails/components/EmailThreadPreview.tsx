import styled from '@emotion/styled';
import { useRecoilCallback } from 'recoil';
import { Avatar, GRAY_SCALE } from 'twenty-ui';

import { ActivityRow } from '@/activities/components/ActivityRow';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { emailThreadIdWhenEmailThreadWasClosedState } from '@/activities/emails/states/lastViewableEmailThreadIdState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { MessageChannelVisibility, TimelineThread } from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';

const StyledHeading = styled.div<{ unread: boolean }>`
  display: flex;
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
  thread: TimelineThread;
};

export const EmailThreadPreview = ({ thread }: EmailThreadPreviewProps) => {
  const { openEmailThread } = useEmailThread();

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

  const { isSameEventThanRightDrawerClose } = useRightDrawer();

  const handleThreadClick = useRecoilCallback(
    ({ snapshot }) =>
      (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const clickJustTriggeredEmailDrawerClose =
          isSameEventThanRightDrawerClose(event.nativeEvent);

        const emailThreadIdWhenEmailThreadWasClosed = snapshot
          .getLoadable(emailThreadIdWhenEmailThreadWasClosedState)
          .getValue();

        const canOpen =
          thread.visibility === MessageChannelVisibility.ShareEverything &&
          (!clickJustTriggeredEmailDrawerClose ||
            emailThreadIdWhenEmailThreadWasClosed !== thread.id);

        if (canOpen) {
          openEmailThread(thread.id);
        }
      },
    [
      isSameEventThanRightDrawerClose,
      openEmailThread,
      thread.id,
      thread.visibility,
    ],
  );

  const isDisabled = visibility !== MessageChannelVisibility.ShareEverything;

  return (
    <ActivityRow
      onClick={(event) => handleThreadClick(event)}
      disabled={isDisabled}
    >
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
              color={isCountIcon ? GRAY_SCALE.gray50 : undefined}
              backgroundColor={isCountIcon ? GRAY_SCALE.gray10 : undefined}
            />
          )}
        </StyledParticipantsContainer>

        <StyledSenderNames>{senderNames}</StyledSenderNames>
        <StyledThreadCount>{thread.numberOfMessagesInThread}</StyledThreadCount>
      </StyledHeading>

      <StyledSubjectAndBody>
        {visibility !== MessageChannelVisibility.Metadata && (
          <StyledSubject>{thread.subject}</StyledSubject>
        )}
        {visibility === MessageChannelVisibility.ShareEverything && (
          <StyledBody>{thread.lastMessageBody}</StyledBody>
        )}
        {visibility !== MessageChannelVisibility.ShareEverything && (
          <EmailThreadNotShared />
        )}
      </StyledSubjectAndBody>
      <StyledReceivedAt>
        {formatToHumanReadableDate(thread.lastMessageReceivedAt)}
      </StyledReceivedAt>
    </ActivityRow>
  );
};
