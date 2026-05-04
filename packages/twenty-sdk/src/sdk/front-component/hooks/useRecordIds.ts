import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectRecordIds = (
  context: FrontComponentExecutionContext,
): string[] => context.recordIds;

export const useRecordIds = (): string[] => {
  return useFrontComponentExecutionContext(selectRecordIds);
};
