import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectUserId = (
  context: FrontComponentExecutionContext | undefined,
): string | null | undefined => context?.userId;

export const useUserId = (): string | null | undefined => {
  return useFrontComponentExecutionContext(selectUserId);
};
