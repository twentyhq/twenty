import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectRecordId = (
  context: FrontComponentExecutionContext,
): string | null =>
  context.recordIds.length === 1 ? context.recordIds[0] : null;

/**
 * Returns the selected record ID when exactly one record is selected,
 * otherwise returns null. Use `useRecordIds()` for multi-record operations.
 */
export const useRecordId = (): string | null => {
  return useFrontComponentExecutionContext(selectRecordId);
};
