/* @license Enterprise */

import {
  FeatureFlagKey,
  MetadataReadability,
  ObjectSharingReach,
} from 'twenty-shared/types';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { isRecordShareExceptionObject } from 'src/engine/core-modules/record-share/utils/is-record-share-exception-object.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';

// A record shared by name reaches people whose role cannot otherwise access
// its object, but only to view or edit it: deleting it, creating siblings or
// managing its access stay with the roles that can access the object
const OPERATION_TYPES_GRANTABLE_BEYOND_ROLE: OperationType[] = [
  'select',
  'update',
];

// Visibility gating is an operator switch on reads only: with it off, shares
// keep being written but grant nothing, so sharingMode and canShareBeyondRole
// ignore it while isVisibilityGatingEnabled and
// operationTypesGrantedBeyondRole follow it
export type ObjectSharing = {
  sharingMode: RecordSharingMode;
  isVisibilityGatingEnabled: boolean;
  canShareBeyondRole: boolean;
  operationTypesGrantedBeyondRole: OperationType[];
};

const resolveSharingMode = ({
  flatObjectMetadata,
  isRecordSharingEnabled,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'readability' | 'isSystem'>;
  isRecordSharingEnabled: boolean;
}): RecordSharingMode => {
  switch (flatObjectMetadata.readability) {
    case MetadataReadability.PRIVATE:
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

export const resolveObjectSharing = ({
  flatObjectMetadata,
  featureFlagsMap,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'readability' | 'isSystem' | 'sharingReach'
  >;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): ObjectSharing => {
  const isRecordSharingEnabled =
    featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false;
  // A workspace without a row for this flag keeps gating on
  const isVisibilityGatingEnabled =
    featureFlagsMap[
      FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED
    ] !== false;
  const sharingMode = resolveSharingMode({
    flatObjectMetadata,
    isRecordSharingEnabled,
  });
  const canShareBeyondRole =
    isRecordSharingEnabled &&
    sharingMode !== RecordSharingMode.ROLE_ONLY &&
    !flatObjectMetadata.isSystem &&
    flatObjectMetadata.sharingReach === ObjectSharingReach.WORKSPACE;

  return {
    sharingMode,
    isVisibilityGatingEnabled,
    canShareBeyondRole,
    operationTypesGrantedBeyondRole:
      isVisibilityGatingEnabled && canShareBeyondRole
        ? OPERATION_TYPES_GRANTABLE_BEYOND_ROLE
        : [],
  };
};
