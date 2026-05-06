import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectSelectedRecordIds = (
  context: FrontComponentExecutionContext,
): string[] => context.selectedRecordIds;

export const useSelectedRecordIds = (): string[] => {
  return useFrontComponentExecutionContext(selectSelectedRecordIds);
};
