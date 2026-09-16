import { isUndefined } from '@sniptt/guards';
import { NOT_RECORDED_RECALL_SUB_CODES } from 'src/logic-functions/constants/NOT_RECORDED_RECALL_SUB_CODES';

export const isNotRecordedRecallSubCode = (
  subCode: string | undefined,
): boolean =>
  !isUndefined(subCode) && NOT_RECORDED_RECALL_SUB_CODES.includes(subCode);
