/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';

import { isRecordShareExceptionObject } from 'src/engine/core-modules/record-share/utils/is-record-share-exception-object.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const isRecordShareableObject = ({
  flatObjectMetadata,
  isRecordSharingEnabled,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'readability' | 'isSystem'>;
  isRecordSharingEnabled: boolean;
}): boolean =>
  flatObjectMetadata.readability === MetadataReadability.PRIVATE ||
  flatObjectMetadata.readability === MetadataReadability.INHERITED ||
  (isRecordSharingEnabled && isRecordShareExceptionObject(flatObjectMetadata));
