import { type ObjectRecord } from 'twenty-shared/types';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type CommonPageInfo } from 'src/engine/api/common/types/common-page-info.type';
import { type CursorPageFlags } from 'src/engine/api/types/cursor-page-flags.type';
import { encodeCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { type OrderByValuesByRecordId } from 'src/engine/api/utils/build-order-by-values-by-record-id.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getPageInfo = ({
  records,
  orderBy,
  pageInfo,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  orderByValuesByRecordId,
}: {
  records: ObjectRecord[];
  orderBy: ObjectRecordOrderBy;
  pageInfo: CursorPageFlags;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  orderByValuesByRecordId?: OrderByValuesByRecordId;
}): CommonPageInfo => {
  const encodeRecordCursor = (record: ObjectRecord) =>
    encodeCursor({
      objectRecord: record,
      order: orderBy,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      orderByValuesFromScan: orderByValuesByRecordId?.[record.id],
    });

  return {
    startCursor: records.length > 0 ? encodeRecordCursor(records[0]) : null,
    endCursor:
      records.length > 0
        ? encodeRecordCursor(records[records.length - 1])
        : null,
    ...pageInfo,
  };
};
