/* @license Enterprise */

import { type ObjectPermissionAction } from 'twenty-shared/application';
import { FeatureFlagKey } from 'twenty-shared/types';

import { isNonEmptyArray } from 'twenty-shared/utils';

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
    'isSystem' | 'disabledObjectPermissionActions'
  >;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): ObjectSharing => {
  const isRecordSharingEnabled =
    featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false;

  // System objects stay out since nobody shares them from the product
  if (!isRecordSharingEnabled || flatObjectMetadata.isSystem) {
    return {
      sharingMode: RecordSharingMode.ROLE_ONLY,
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
    sharingMode: RecordSharingMode.OPEN_BY_DEFAULT,
    canShareBeyondRole: isNonEmptyArray(operationTypesGrantedBeyondRole),
    operationTypesGrantedBeyondRole,
  };
};
