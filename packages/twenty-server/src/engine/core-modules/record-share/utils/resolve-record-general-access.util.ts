/* @license Enterprise */

import {
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type RecordGeneralAccess = {
  // null: the record follows the records it is linked to
  accessLevel: RecordShareAccessLevel | null;
  isDefault: boolean;
};

const resolveDefaultGeneralAccessLevel = ({
  readability,
  isRecordShareExceptionObject,
}: {
  readability: FlatObjectMetadata['readability'];
  isRecordShareExceptionObject: boolean;
}): RecordShareAccessLevel | null => {
  if (isRecordShareExceptionObject) {
    return RecordShareAccessLevel.READ_WRITE;
  }

  return readability === MetadataReadability.INHERITED
    ? null
    : RecordShareAccessLevel.NONE;
};

export const resolveRecordGeneralAccess = ({
  readability,
  isRecordShareExceptionObject,
  recordShares,
}: {
  readability: FlatObjectMetadata['readability'];
  isRecordShareExceptionObject: boolean;
  recordShares: RecordShare[];
}): RecordGeneralAccess => {
  const everyoneManualShare = recordShares.find(
    (recordShare) =>
      recordShare.principalType === RecordSharePrincipalType.EVERYONE &&
      recordShare.rowCause === RecordShareRowCause.MANUAL,
  );

  if (isDefined(everyoneManualShare)) {
    return { accessLevel: everyoneManualShare.accessLevel, isDefault: false };
  }

  return {
    accessLevel: resolveDefaultGeneralAccessLevel({
      readability,
      isRecordShareExceptionObject,
    }),
    isDefault: true,
  };
};
