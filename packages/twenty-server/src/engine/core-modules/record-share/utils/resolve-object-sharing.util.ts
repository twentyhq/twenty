/* @license Enterprise */

import { type ObjectPermissionAction } from 'twenty-shared/application';
import {
  FeatureFlagKey,
  MetadataReadability,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { isNonEmptyArray } from 'twenty-shared/utils';

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
  isShareable: boolean;
  isShareRequired: boolean;
  // General access of a record without an everyone row, null when its object is not shareable
  defaultGeneralAccessLevel: RecordShareAccessLevel | null;
  canShareBeyondRole: boolean;
  operationTypesGrantedBeyondRole: OperationType[];
};

const resolveDefaultGeneralAccessLevel = ({
  isShareable,
  isShareRequired,
}: Pick<
  ObjectSharing,
  'isShareable' | 'isShareRequired'
>): RecordShareAccessLevel | null => {
  if (isShareRequired) {
    return RecordShareAccessLevel.NONE;
  }

  return isShareable ? RecordShareAccessLevel.READ_WRITE : null;
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
  const isShareRequired =
    flatObjectMetadata.readability === MetadataReadability.PRIVATE;
  // Records of other shareable objects follow their roles unless made private one by one
  const isShareable =
    isShareRequired || (isRecordSharingEnabled && !flatObjectMetadata.isSystem);

  const operationTypesGrantedBeyondRole =
    isRecordSharingEnabled && !flatObjectMetadata.isSystem
      ? OPERATIONS_GRANTABLE_BEYOND_ROLE.filter(
          ({ objectPermissionAction }) =>
            !flatObjectMetadata.disabledObjectPermissionActions?.includes(
              objectPermissionAction,
            ),
        ).map(({ operationType }) => operationType)
      : [];

  return {
    isShareable,
    isShareRequired,
    defaultGeneralAccessLevel: resolveDefaultGeneralAccessLevel({
      isShareable,
      isShareRequired,
    }),
    canShareBeyondRole: isNonEmptyArray(operationTypesGrantedBeyondRole),
    operationTypesGrantedBeyondRole,
  };
};
