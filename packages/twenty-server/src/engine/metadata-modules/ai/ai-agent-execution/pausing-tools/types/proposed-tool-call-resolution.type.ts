import { type ProposedToolCall } from 'twenty-shared/ai';

export type ProposedToolCallResolution =
  | { proposal: ProposedToolCall }
  | { error: string };
