import { type SetuAiTaskProjection } from 'twenty-shared/ai';

export type AiTaskStateEntry =
  | { status: 'loading' }
  | { status: 'available'; task: SetuAiTaskProjection }
  | { status: 'unavailable' }
  | { status: 'unsupported-version' };
