import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectRecordId = (
  context: FrontComponentExecutionContext,
): string | null => context.recordId;

/**
 * @deprecated Use `useRecordIds` instead. This hook returns only the first
 * selected record ID or null when multiple records are selected.
 */
export const useRecordId = (): string | null => {
  return useFrontComponentExecutionContext(selectRecordId);
};
