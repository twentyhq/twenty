import { type ObjectRecord } from 'twenty-shared/types';

export const prepareRecordForUpsertUpdate = ({
  record,
  hasManualAssignmentField,
}: {
  record: Partial<ObjectRecord>;
  hasManualAssignmentField: boolean;
}): Partial<ObjectRecord> => ({
  ...record,
  deletedAt: null,
  ...(hasManualAssignmentField ? { isManuallyAssigned: true } : {}),
});
