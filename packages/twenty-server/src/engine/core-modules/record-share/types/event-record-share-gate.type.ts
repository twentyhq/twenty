import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';

export type EventRecordShareGate = {
  resolveAdmittedRecordIds: (
    subject: RowAccessPolicySubject,
  ) => Promise<Set<string>>;
};
