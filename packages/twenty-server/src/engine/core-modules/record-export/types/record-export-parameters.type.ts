import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type RecordExportParameters = {
  objectMetadataId: string;
  fieldMetadataIds: string[];
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
};
