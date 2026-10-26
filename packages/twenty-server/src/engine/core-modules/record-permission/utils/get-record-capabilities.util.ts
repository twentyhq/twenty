import {
  MetadataReadability,
  MetadataWritability,
  type RecordCapabilities,
} from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getRecordCapabilities = (
  object: Pick<
    FlatObjectMetadata,
    'readability' | 'writability' | 'recordCapabilities'
  >,
): RecordCapabilities => ({
  ...(object.readability === MetadataReadability.SYSTEM ||
  object.readability === MetadataReadability.APPLICATION
    ? { read: false }
    : {}),
  ...(object.writability !== MetadataWritability.OPEN
    ? {
        update: false,
        softDelete: false,
        destroy: false,
        share: false,
        create: false,
        restore: false,
      }
    : {}),
  ...object.recordCapabilities,
});
