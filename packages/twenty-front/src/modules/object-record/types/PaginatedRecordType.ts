import { PaginatedRecordTypeResults } from './PaginatedRecordTypeResults';

export type PaginatedRecordType<RecordType extends { id: string }> = {
  [objectNamePlural: string]: PaginatedRecordTypeResults<RecordType>;
};
