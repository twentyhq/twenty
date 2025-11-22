import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

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
export type GroupByRelationField = {
  fieldMetadata: FieldMetadataEntity;
  nestedFieldMetadata: FieldMetadataEntity;
  nestedSubFieldName?: string;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
};
export type GroupByField =
  | GroupByRegularField
  | GroupByDateField
  | GroupByRelationField;
