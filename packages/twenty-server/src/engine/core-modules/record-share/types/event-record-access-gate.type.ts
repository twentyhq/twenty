/* @license Enterprise */

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissions } from 'twenty-shared/types';

import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';

export type EventRecordAccessGate = {
  resolveAdmittedRecordIds: (
    subject: RowAccessPolicySubject,
  ) => Promise<Set<string>>;
  applyVisibilityRestrictions: <TEvent extends ObjectRecordEvent>(args: {
    events: TEvent[];
    objectsPermissions: ObjectsPermissions;
  }) => Promise<TEvent[]>;
};
