import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type DynamicFieldFilter = {
  flatObjectMetadata: FlatObjectMetadata;
  dynamicFieldName: string;
  dynamicFieldFilter: ObjectRecordFilter;
  relationTargetFlatObjectMetadata: FlatObjectMetadata | undefined;
};
