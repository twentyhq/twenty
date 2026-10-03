/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { isRecordShareExceptionObject } from 'src/engine/core-modules/record-share/utils/is-record-share-exception-object.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const resolveRecordSharingMode = ({
  flatObjectMetadata,
  isRecordSharingEnabled,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'readability' | 'isSystem'>;
  isRecordSharingEnabled: boolean;
}): RecordSharingMode => {
  switch (flatObjectMetadata.readability) {
    case MetadataReadability.PRIVATE:
    case MetadataReadability.DISCOVERABLE:
      return RecordSharingMode.PRIVATE;
    case MetadataReadability.INHERITED:
      return RecordSharingMode.INHERITED;
    default:
      return isRecordSharingEnabled &&
        isRecordShareExceptionObject(flatObjectMetadata)
        ? RecordSharingMode.OPEN_BY_DEFAULT
        : RecordSharingMode.ROLE_ONLY;
  }
};
