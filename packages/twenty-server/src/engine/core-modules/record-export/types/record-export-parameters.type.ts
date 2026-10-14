import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type RecordExportTraversedField = {
  fieldMetadataId: string;
  relationTargetFieldMetadataId: string;
};

export type RecordExportParameters = {
  objectMetadataId: string;
  fieldMetadataIds: string[];
  traversedFields?: RecordExportTraversedField[];
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
};
