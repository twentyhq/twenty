import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectRecordId = (
  context: FrontComponentExecutionContext,
): string | null =>
  context.recordIds.length === 1 ? context.recordIds[0] : null;

/**
 * @deprecated Use `useRecordIds()` instead. For single-record operations,
 * use `recordIds.length === 1 ? recordIds[0] : null`.
 */
export const useRecordId = (): string | null => {
  return useFrontComponentExecutionContext(selectRecordId);
};
