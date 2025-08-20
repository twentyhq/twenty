import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export type RecordsWithObjectMetadataItem = {
  objectMetadataItem: ObjectMetadataItemWithFieldMaps;
  records: ObjectRecord[];
};
