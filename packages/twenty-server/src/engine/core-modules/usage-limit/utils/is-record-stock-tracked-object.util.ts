import { RECORD_STOCK_TRACKED_SYSTEM_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/usage-limit/constants/record-stock-tracked-system-object-universal-identifiers.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const isRecordStockTrackedObject = (
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'isSystem' | 'universalIdentifier'
  >,
): boolean =>
  !flatObjectMetadata.isSystem ||
  RECORD_STOCK_TRACKED_SYSTEM_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
    flatObjectMetadata.universalIdentifier,
  );
