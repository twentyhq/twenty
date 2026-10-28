/* @license Enterprise */

import { type ObjectPermissionAction } from 'twenty-shared/application';
import { FeatureFlagKey, MetadataReadability } from 'twenty-shared/types';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { isRecordShareExceptionObject } from 'src/engine/core-modules/record-share/utils/is-record-share-exception-object.util';
import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';

// A record shared by name reaches people whose role cannot otherwise access
// its object, but only to view or edit it: deleting it, creating siblings or
// managing its access stay with the roles that can access the object
const OPERATIONS_GRANTABLE_BEYOND_ROLE: {
  operationType: OperationType;
  objectPermissionAction: ObjectPermissionAction;
}[] = [
  { operationType: 'select', objectPermissionAction: 'canReadObjectRecords' },
  { operationType: 'update', objectPermissionAction: 'canUpdateObjectRecords' },
];

export type ObjectSharing = {
  sharingMode: RecordSharingMode;
  canShareBeyondRole: boolean;
  operationTypesGrantedBeyondRole: OperationType[];
};

export const resolveObjectSharing = ({
  flatObjectMetadata,
  featureFlagsMap,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'readability' | 'isSystem' | 'disabledObjectPermissionActions'
  >;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): ObjectSharing => {
  const isRecordSharingEnabled =
    featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false;

  // Private records are only reached through their shares, whatever the flag
  const sharingMode =
    flatObjectMetadata.readability === MetadataReadability.PRIVATE
      ? RecordSharingMode.PRIVATE
      : isRecordSharingEnabled &&
          isRecordShareExceptionObject(flatObjectMetadata)
        ? RecordSharingMode.OPEN_BY_DEFAULT
        : RecordSharingMode.ROLE_ONLY;

  if (!isRecordSharingEnabled || flatObjectMetadata.isSystem) {
    return {
      sharingMode,
      canShareBeyondRole: false,
      operationTypesGrantedBeyondRole: [],
    };
  }

  const operationTypesGrantedBeyondRole =
    OPERATIONS_GRANTABLE_BEYOND_ROLE.filter(
      ({ objectPermissionAction }) =>
        !flatObjectMetadata.disabledObjectPermissionActions?.includes(
          objectPermissionAction,
        ),
    ).map(({ operationType }) => operationType);

  return {
    sharingMode,
    canShareBeyondRole: isNonEmptyArray(operationTypesGrantedBeyondRole),
    operationTypesGrantedBeyondRole,
  };
};
