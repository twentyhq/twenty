const RECALL_STATUS_UNAUTHORIZED = 401;
const RECALL_STATUS_PAYMENT_REQUIRED = 402;
const RECALL_STATUS_FORBIDDEN = 403;

export const isRecallAccountStatus = (status: number): boolean =>
  status === RECALL_STATUS_UNAUTHORIZED ||
  status === RECALL_STATUS_PAYMENT_REQUIRED ||
  status === RECALL_STATUS_FORBIDDEN;

export {
  isRetryableRecallApiStatus,
  resolveRecallApiRetryDelayMs,
} from '../../../../../shared/recall/recall-api-retry-policy.util';
