/* @license Enterprise */

import { ObjectSharingReach } from 'twenty-shared/types';

import { isRecordShareableObject } from 'src/engine/core-modules/record-share/utils/is-record-shareable-object.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';

// A record shared by name reaches people whose role cannot otherwise access
// its object, but only to view or edit it: deleting it, creating siblings or
// managing its access stay with the roles that can access the object
const OPERATION_TYPES_GRANTABLE_BEYOND_ROLE: OperationType[] = [
  'select',
  'update',
];

export const isRecordGrantBeyondRoleAllowed = ({
  flatObjectMetadata,
  operationType,
  isRecordSharingEnabled,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'readability' | 'isSystem' | 'sharingReach'
  >;
  operationType: OperationType;
  isRecordSharingEnabled: boolean;
}): boolean =>
  isRecordSharingEnabled &&
  flatObjectMetadata.sharingReach === ObjectSharingReach.WORKSPACE &&
  OPERATION_TYPES_GRANTABLE_BEYOND_ROLE.includes(operationType) &&
  isRecordShareableObject({ flatObjectMetadata, isRecordSharingEnabled });
