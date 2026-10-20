import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectLocationSearch = (
  context: FrontComponentExecutionContext,
): string => context.location?.search ?? '';

export const useLocationSearch = (): string => {
  return useFrontComponentExecutionContext(selectLocationSearch);
};
