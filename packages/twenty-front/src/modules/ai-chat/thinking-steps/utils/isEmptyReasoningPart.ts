import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

export const isEmptyReasoningPart = (part: ExtendedUIMessagePart): boolean =>
  part.type === 'reasoning' &&
  part.state !== 'streaming' &&
  part.text.trim().length === 0;
