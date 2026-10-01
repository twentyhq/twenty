/* @license Enterprise */

import { isRecordShareExceptionObject } from 'src/engine/core-modules/record-share/utils/is-record-share-exception-object.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const shouldEnforceRecordShareExceptions = ({
  flatObjectMetadata,
  isRecordSharingEnabled,
  canAccessAllRecords,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'readability' | 'isSystem'>;
  isRecordSharingEnabled: boolean;
  canAccessAllRecords: boolean;
}): boolean =>
  isRecordSharingEnabled &&
  !canAccessAllRecords &&
  isRecordShareExceptionObject(flatObjectMetadata);
