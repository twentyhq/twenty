import { FIREFLIES_PLANS, type FirefliesPlan, type SummaryFetchConfig, type SummaryStrategy } from './types';

export const toBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

export const getApiUrl = (): string => {
  return process.env.SERVER_URL || 'http://localhost:3000';
};

export const getSummaryFetchConfig = (): SummaryFetchConfig => {
  const strategy = (process.env.FIREFLIES_SUMMARY_STRATEGY as SummaryStrategy) || 'immediate_with_retry';

  // Ultra-conservative defaults to respect 50 requests/day API limit
  // With 3 attempts at 15-minute intervals, max 3 API calls per webhook (45 minutes total)
  return {
    strategy,
    retryAttempts: parseInt(process.env.FIREFLIES_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.FIREFLIES_RETRY_DELAY || '120000', 10), // 2 minutes
    pollInterval: parseInt(process.env.FIREFLIES_POLL_INTERVAL || '120000', 10), // 2 minutes
    maxPolls: parseInt(process.env.FIREFLIES_MAX_POLLS || '3', 10),
  };
};

export const shouldAutoCreateContacts = (): boolean => {
  return toBoolean(process.env.AUTO_CREATE_CONTACTS, true);
};

export const getFirefliesPlan = (): FirefliesPlan => {
  const plan = (process.env.FIREFLIES_PLAN || FIREFLIES_PLANS.FREE).toLowerCase();
  if (plan === FIREFLIES_PLANS.BUSINESS || plan === FIREFLIES_PLANS.ENTERPRISE) {
    return plan as FirefliesPlan;
  }
  if (plan === FIREFLIES_PLANS.PRO) {
    return FIREFLIES_PLANS.PRO;
  }
  return FIREFLIES_PLANS.FREE;
};

