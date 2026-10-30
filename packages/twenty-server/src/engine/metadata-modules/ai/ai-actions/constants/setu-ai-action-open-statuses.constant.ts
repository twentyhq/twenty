import { type SetuAiActionStatus } from 'twenty-shared/ai';

// Matches the partial unique index: at most one of these per logical action.
export const SETU_AI_ACTION_OPEN_STATUSES: SetuAiActionStatus[] = [
  'pending_review',
  'queued',
  'running',
  'delivery_unknown',
];
