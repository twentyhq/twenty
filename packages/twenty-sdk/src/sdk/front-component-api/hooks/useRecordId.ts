import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectRecordId = (
  context: FrontComponentExecutionContext,
): string | null => context.recordId;

export const useRecordId = (): string | null => {
  return useFrontComponentExecutionContext(selectRecordId);
};
