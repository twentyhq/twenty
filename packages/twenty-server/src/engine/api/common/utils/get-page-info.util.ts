import { type ObjectRecord } from 'twenty-shared/types';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type CommonPageInfo } from 'src/engine/api/common/types/common-page-info.type';
import { type CursorPageFlags } from 'src/engine/api/types/cursor-page-flags.type';
import { encodeCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getPageInfo = ({
  records,
  orderBy,
  pageInfo,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  records: ObjectRecord[];
  orderBy: ObjectRecordOrderBy;
  pageInfo: CursorPageFlags;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): CommonPageInfo => {
  const startCursor =
    records.length > 0
      ? encodeCursor({
          objectRecord: records[0],
          order: orderBy,
          flatObjectMetadata,
          flatFieldMetadataMaps,
        })
      : null;
  const endCursor =
    records.length > 0
      ? encodeCursor({
          objectRecord: records[records.length - 1],
          order: orderBy,
          flatObjectMetadata,
          flatFieldMetadataMaps,
        })
      : null;

  return { startCursor, endCursor, ...pageInfo };
};
