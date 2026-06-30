import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectRecordId = (
  context: FrontComponentExecutionContext,
): string | null =>
  context.selectedRecordIds.length === 1 ? context.selectedRecordIds[0] : null;

/**
 * @deprecated Use `useSelectedRecordIds()` instead. For single-record operations,
 * use `selectedRecordIds.length === 1 ? selectedRecordIds[0] : null`.
 */
export const useRecordId = (): string | null => {
  return useFrontComponentExecutionContext(selectRecordId);
};
