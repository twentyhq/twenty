import { isUndefined } from '@sniptt/guards';

import { NOT_RECORDED_RECALL_SUB_CODES } from 'src/logic-functions/constants/not-recorded-recall-sub-codes';

export const isNotRecordedRecallEnd = ({
  statusCode,
  statusSubCode,
}: {
  statusCode: string | undefined;
  statusSubCode: string | undefined;
}): boolean =>
  (statusCode === 'call_ended' || statusCode === 'fatal') &&
  !isUndefined(statusSubCode) &&
  NOT_RECORDED_RECALL_SUB_CODES.includes(statusSubCode);
