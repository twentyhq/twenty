import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { DIRECT_MESSAGE_PERMISSION_OBJECTS } from 'src/engine/permissions/direct-message/constants/direct-message-permission-objects.constant';
import { buildPermissionsDirectMessageCondition } from 'src/engine/permissions/direct-message/utils/build-permissions-direct-message-condition.util';
import { findDirectMessageAdmittedRecordIds } from 'src/engine/permissions/direct-message/utils/find-direct-message-admitted-record-ids.util';
import { type ObjectRowAccessPolicy } from 'src/engine/permissions/row-policy/types/object-row-access-policy.type';

export const DIRECT_MESSAGE_ROW_ACCESS_POLICY: ObjectRowAccessPolicy = {
  objectUniversalIdentifiers: DIRECT_MESSAGE_PERMISSION_OBJECTS.map(
    (objectName) => STANDARD_OBJECTS[objectName].universalIdentifier,
  ),
  buildCondition: buildPermissionsDirectMessageCondition,
  findAdmittedRecordIds: findDirectMessageAdmittedRecordIds,
  validateWritesOrThrow: async () => undefined,
  validateSharingOrThrow: async () => undefined,
};
