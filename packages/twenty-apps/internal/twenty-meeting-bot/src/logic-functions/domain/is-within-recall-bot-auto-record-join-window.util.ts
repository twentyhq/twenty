import { RECALL_BOT_AUTO_RECORD_JOIN_GRACE_MS } from 'src/logic-functions/constants/recall-bot-auto-record-join-grace-ms';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const isWithinRecallBotAutoRecordJoinWindow = ({
  startsAt,
  now,
}: {
  startsAt: string | undefined;
  now: Date;
}): boolean => {
  if (!isNonEmptyString(startsAt)) {
    return true;
  }

  const startsAtTime = new Date(startsAt).getTime();

  if (Number.isNaN(startsAtTime)) {
    return true;
  }

  return now.getTime() <= startsAtTime + RECALL_BOT_AUTO_RECORD_JOIN_GRACE_MS;
};
