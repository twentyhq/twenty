import { type ObjectRecordGroupByDateGranularity } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type GroupByRegularField = {
  fieldMetadata: FieldMetadataEntity;
  subFieldName?: string;
};
export type GroupByDateField = {
  fieldMetadata: FieldMetadataEntity;
  subFieldName?: string;
  dateGranularity: ObjectRecordGroupByDateGranularity;
};
export type GroupByField = GroupByRegularField | GroupByDateField;
