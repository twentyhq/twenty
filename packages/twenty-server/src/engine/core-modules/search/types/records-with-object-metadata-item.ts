import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export type RecordsWithObjectMetadataItem = {
  objectMetadataItem: ObjectMetadataItemWithFieldMaps;
  records: ObjectRecord[];
};
