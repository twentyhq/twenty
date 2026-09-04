const MAX_FAILURE_REASON_LENGTH = 1000;

export const getApplicationFailureReason = (error: unknown): string => {
  const reason = error instanceof Error ? error.message : String(error);

  return reason.slice(0, MAX_FAILURE_REASON_LENGTH);
};
