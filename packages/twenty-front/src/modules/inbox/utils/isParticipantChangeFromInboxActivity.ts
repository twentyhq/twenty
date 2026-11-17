import { INBOX_NOTIFICATION_PARTICIPANT_MATCH_WINDOW_MS } from '@/inbox/constants/InboxNotificationParticipantMatchWindowMs';

export const isParticipantChangeFromInboxActivity = ({
  participantUpdatedAt,
  lastActivityAt,
}: {
  participantUpdatedAt: string;
  lastActivityAt: string;
}): boolean =>
  Math.abs(
    new Date(participantUpdatedAt).getTime() -
      new Date(lastActivityAt).getTime(),
  ) <= INBOX_NOTIFICATION_PARTICIPANT_MATCH_WINDOW_MS;
