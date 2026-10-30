import { type SetuAiActionProjection } from 'twenty-shared/ai';

export type AiActionStateEntry =
  | { status: 'loading' }
  | { status: 'available'; action: SetuAiActionProjection }
  | { status: 'unavailable' }
  | { status: 'unsupported-version' };
