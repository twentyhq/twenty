import { useRecordIndexContextOrUndefined } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

const NO_ADDITIONAL_FILTER: RecordGqlOperationFilter = {};

export const useRecordIndexAdditionalFilter = (): RecordGqlOperationFilter =>
  useRecordIndexContextOrUndefined()?.additionalFilter ?? NO_ADDITIONAL_FILTER;
