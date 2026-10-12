import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectSelectedRecordsFilter = (
  context: FrontComponentExecutionContext,
): RecordGqlOperationFilter | null => context.selectedRecordsFilter ?? null;

export const useSelectedRecordsFilter = (): RecordGqlOperationFilter | null => {
  return useFrontComponentExecutionContext(selectSelectedRecordsFilter);
};
