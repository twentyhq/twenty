import { isUndefined } from '@sniptt/guards';

import { NOT_ATTENDED_RECALL_SUB_CODES } from 'src/logic-functions/constants/not-attended-recall-sub-codes';

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
