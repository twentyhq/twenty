export const WARM_UP_LOGIC_FUNCTION_JOB_NAME = 'WarmUpLogicFunctionJob';

export const WARM_UP_LOGIC_FUNCTION_RATE_LIMITED_RETRY = {
  maxRetryCount: 5,
  baseDelayMs: 30_000,
};

export type WarmUpLogicFunctionJobData = {
  workspaceId: string;
  applicationId: string;
  logicFunctionUniversalIdentifier: string;
  rateLimitedRetryCount?: number;
};
