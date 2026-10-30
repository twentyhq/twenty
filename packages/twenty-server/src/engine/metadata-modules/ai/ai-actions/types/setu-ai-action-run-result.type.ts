import {
  type SetuAiActionReceipt,
  type SetuAiActionStatus,
  type SetuAiErrorCode,
} from 'twenty-shared/ai';

import { type SetuAiActionAttemptOutcome } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-attempt-outcome.type';

export type SetuAiActionRunResult = {
  status: Extract<
    SetuAiActionStatus,
    'succeeded' | 'failed' | 'delivery_unknown' | 'blocked'
  >;
  attemptOutcome: SetuAiActionAttemptOutcome;
  errorCode?: SetuAiErrorCode;
  receipt?: SetuAiActionReceipt;
  providerCorrelationId?: string;
};
