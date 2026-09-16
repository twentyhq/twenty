const RECALL_STATUS_RATE_LIMITED = 429;

const RECALL_STATUS_CONFLICT = 409;

const isRecallServerError = (status: number): boolean => status >= 500;

export const isRetryableRecallApiStatus = (status: number): boolean =>
  status === RECALL_STATUS_RATE_LIMITED ||
  status === RECALL_STATUS_CONFLICT ||
  isRecallServerError(status);
