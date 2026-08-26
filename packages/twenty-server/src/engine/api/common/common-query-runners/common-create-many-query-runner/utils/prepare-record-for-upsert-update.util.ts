import { type ObjectRecord } from 'twenty-shared/types';

export const prepareRecordForUpsertUpdate = ({
  record,
  shouldMarkManuallyAssigned,
}: {
  record: Partial<ObjectRecord>;
  shouldMarkManuallyAssigned: boolean;
}): Partial<ObjectRecord> => ({
  ...record,
  deletedAt: null,
  ...(shouldMarkManuallyAssigned ? { isManuallyAssigned: true } : {}),
});
