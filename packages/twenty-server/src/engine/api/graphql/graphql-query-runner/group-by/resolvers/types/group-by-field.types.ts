import { type ObjectRecordGroupByDateBucket } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type GroupByField = {
  fieldMetadata: FieldMetadataEntity;
  subFieldName?: string;
  dateBucket?: ObjectRecordGroupByDateBucket;
};
