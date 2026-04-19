import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectUserId = (context: FrontComponentExecutionContext): string | null =>
  context.userId;

export const useUserId = (): string | null => {
  return useFrontComponentExecutionContext(selectUserId);
};
