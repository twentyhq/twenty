import { RECALL_BOT_AUTO_RECORD_JOIN_GRACE_MS } from 'src/logic-functions/constants/recall-bot-auto-record-join-grace-ms';

export const isWithinRecallBotAutoRecordJoinWindow = ({
  startsAt,
  now,
}: {
  startsAt: string | null;
  now: Date;
}): boolean => {
  if (startsAt === null || startsAt === '') {
    return true;
  }

  const startsAtTime = new Date(startsAt).getTime();

  if (Number.isNaN(startsAtTime)) {
    return true;
  }

  return now.getTime() <= startsAtTime + RECALL_BOT_AUTO_RECORD_JOIN_GRACE_MS;
};
