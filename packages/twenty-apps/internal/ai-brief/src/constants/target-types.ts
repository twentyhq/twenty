export const BRIEF_TARGET_TYPES = ['company', 'person'] as const;

export type BriefTargetType = (typeof BRIEF_TARGET_TYPES)[number];

export const isBriefTargetType = (value: unknown): value is BriefTargetType =>
  BRIEF_TARGET_TYPES.includes(value as BriefTargetType);

export type AccountSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';

export const ACCOUNT_SENTIMENTS: AccountSentiment[] = [
  'POSITIVE',
  'NEUTRAL',
  'NEGATIVE',
  'MIXED',
];

export const isAccountSentiment = (value: unknown): value is AccountSentiment =>
  ACCOUNT_SENTIMENTS.includes(value as AccountSentiment);
