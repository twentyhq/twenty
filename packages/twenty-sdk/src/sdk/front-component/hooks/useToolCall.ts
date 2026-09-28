import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { type FrontComponentToolCall } from '../types/FrontComponentToolCall';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectToolCall = (
  context: FrontComponentExecutionContext,
): FrontComponentToolCall | null => context.toolCall ?? null;

export const useToolCall = (): FrontComponentToolCall | null => {
  return useFrontComponentExecutionContext(selectToolCall);
};
