import { readPausingToolCallStatus } from 'twenty-shared/ai';

export const isAwaitingPausingToolOutput = (toolOutput: unknown): boolean =>
  readPausingToolCallStatus(toolOutput) === 'pending';
