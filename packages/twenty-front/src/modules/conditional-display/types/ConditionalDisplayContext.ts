import { type ConditionalDisplayContextKey } from 'twenty-shared/types';

export type ConditionalDisplayContext = Partial<
  Record<ConditionalDisplayContextKey, string | null>
>;
