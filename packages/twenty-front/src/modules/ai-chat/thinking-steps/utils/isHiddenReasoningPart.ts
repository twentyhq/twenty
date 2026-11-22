import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

export const isHiddenReasoningPart = (part: ExtendedUIMessagePart): boolean =>
  part.type === 'reasoning' &&
  part.state !== 'streaming' &&
  part.text.trim().length === 0;
