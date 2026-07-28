import { isUndefined } from '@sniptt/guards';

import { NOT_ATTENDED_RECALL_SUB_CODES } from 'src/logic-functions/constants/not-attended-recall-sub-codes';

// Only end-of-call statuses carry a meaningful end reason; a no-show can only
// be recognized from those, never from intermediate statuses.
export const isNotAttendedRecallEnd = ({
  statusCode,
  statusSubCode,
}: {
  statusCode: string | undefined;
  statusSubCode: string | undefined;
}): boolean =>
  (statusCode === 'call_ended' || statusCode === 'fatal') &&
  !isUndefined(statusSubCode) &&
  NOT_ATTENDED_RECALL_SUB_CODES.includes(statusSubCode);
