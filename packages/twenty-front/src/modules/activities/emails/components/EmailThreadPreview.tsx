import { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback } from 'recoil';

import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { emailThreadIdWhenEmailThreadWasClosedState } from '@/activities/emails/states/lastViewableEmailThreadIdState';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { GRAY_SCALE } from '@/ui/theme/constants/GrayScale';
import { Avatar } from '@/users/components/Avatar';
import { TimelineThread } from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils';

const StyledCardContent = styled(CardContent)<{ visibility: string }>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(12)};
  padding: ${({ theme }) => theme.spacing(0, 4)};
  cursor: ${({ visibility }) =>
    visibility === 'share_everything' ? 'pointer' : 'default'};
`;

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

export type EmailThreadVisibility = 'metadata' | 'subject' | 'share_everything';

type EmailThreadPreviewProps = {
  divider?: boolean;
  thread: TimelineThread;
};

export const EmailThreadPreview = ({
  divider,
  thread,
}: EmailThreadPreviewProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const { openEmailThread } = useEmailThread();

  const visibility = thread.visibility as EmailThreadVisibility;

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
          thread.visibility === 'share_everything' &&
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

  return (
    <StyledCardContent
      ref={cardRef}
      onClick={(event) => handleThreadClick(event)}
      divider={divider}
      visibility={visibility}
    >
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
              color={isCountIcon ? GRAY_SCALE.gray50 : undefined}
              backgroundColor={isCountIcon ? GRAY_SCALE.gray10 : undefined}
            />
          )}
        </StyledParticipantsContainer>

        <StyledSenderNames>{senderNames}</StyledSenderNames>
        <StyledThreadCount>{thread.numberOfMessagesInThread}</StyledThreadCount>
      </StyledHeading>

      <StyledSubjectAndBody>
        {visibility !== 'metadata' && (
          <StyledSubject>{thread.subject}</StyledSubject>
        )}
        {visibility === 'share_everything' && (
          <StyledBody>{thread.lastMessageBody}</StyledBody>
        )}
        {visibility !== 'share_everything' && <EmailThreadNotShared />}
      </StyledSubjectAndBody>
      <StyledReceivedAt>
        {formatToHumanReadableDate(thread.lastMessageReceivedAt)}
      </StyledReceivedAt>
    </StyledCardContent>
  );
};
