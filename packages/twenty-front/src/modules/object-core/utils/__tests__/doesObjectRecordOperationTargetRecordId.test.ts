import { doesObjectRecordOperationTargetRecordId } from '@/object-core/utils/doesObjectRecordOperationTargetRecordId';
import { type ObjectRecord } from 'twenty-shared/types';

const RECORD_ID = 'e4d1a2f0-1111-4a2b-9c3d-000000000001';
const OTHER_RECORD_ID = 'e4d1a2f0-2222-4a2b-9c3d-000000000002';

const buildRecord = (id: string) => ({ id }) as ObjectRecord;

describe('doesObjectRecordOperationTargetRecordId', () => {
  it('matches a delete-one on the same record', () => {
    expect(
      doesObjectRecordOperationTargetRecordId({
        operation: { type: 'delete-one', deletedRecordId: RECORD_ID },
        recordId: RECORD_ID,
      }),
    ).toBe(true);
  });

  it('ignores a delete-one on another record', () => {
    expect(
      doesObjectRecordOperationTargetRecordId({
        operation: { type: 'delete-one', deletedRecordId: OTHER_RECORD_ID },
        recordId: RECORD_ID,
      }),
    ).toBe(false);
  });

  it('matches a delete-many containing the record', () => {
    expect(
      doesObjectRecordOperationTargetRecordId({
        operation: {
          type: 'delete-many',
          deletedRecordIds: [OTHER_RECORD_ID, RECORD_ID],
        },
        recordId: RECORD_ID,
      }),
    ).toBe(true);
  });

  it('matches a restore-one on the same record', () => {
    expect(
      doesObjectRecordOperationTargetRecordId({
        operation: {
          type: 'restore-one',
          restoredRecord: buildRecord(RECORD_ID),
        },
        recordId: RECORD_ID,
      }),
    ).toBe(true);
  });

  it('matches a restore-many containing the record', () => {
    expect(
      doesObjectRecordOperationTargetRecordId({
        operation: {
          type: 'restore-many',
          restoredRecords: [buildRecord(RECORD_ID)],
        },
        recordId: RECORD_ID,
      }),
    ).toBe(true);
  });

  it('ignores operations that carry no record lifecycle change', () => {
    expect(
      doesObjectRecordOperationTargetRecordId({
        operation: { type: 'destroy-one' },
        recordId: RECORD_ID,
      }),
    ).toBe(false);
  });
});
