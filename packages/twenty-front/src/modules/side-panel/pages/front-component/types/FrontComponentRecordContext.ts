import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type FrontComponentRecordContext = {
  objectNameSingular?: string;
  selectedRecordIds?: string[];
  selectedRecordsFilter?: RecordGqlOperationFilter | null;
};
