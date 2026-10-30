import { type SetuAiActionPayload } from 'twenty-shared/ai';

import { type SetuAiActionPreconditions } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-preconditions.type';

export type PreparedSetuAiAction = SetuAiActionPayload & {
  preconditions: SetuAiActionPreconditions;
};
