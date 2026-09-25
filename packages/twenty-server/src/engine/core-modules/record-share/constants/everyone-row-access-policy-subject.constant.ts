/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';

import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';

export const EVERYONE_ROW_ACCESS_POLICY_SUBJECT: RowAccessPolicySubject = {
  isSystemContext: false,
  objectsPermissions: undefined,
  principalIds: [EVERYONE_PRINCIPAL_ID],
  isOwningApplication: () => false,
  resolveRowLevelPermissionRecordFilter: () => null,
};
