import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { PendingWakeUpEventRecordService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-event-record.service';
import { type FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';

const EVENT = {
  eventName: 'company.updated',
  recordId: 'company-id',
  record: { id: 'company-id', secret: 'hidden' },
  updatedFields: ['name', 'secret'],
};

const decide = ({
  recordRead,
  recordReadAttempt = 0,
  onRecordReadGivenUp = jest.fn(),
}: {
  recordRead: {
    success: boolean;
    result?: { records: object[] };
    error?: string;
  };
  recordReadAttempt?: number;
  onRecordReadGivenUp?: jest.Mock;
}) =>
  new PendingWakeUpEventRecordService({
    execute: jest.fn().mockResolvedValue(recordRead),
  } as unknown as FindRecordsService).decideOnEventRecord({
    event: EVENT,
    authContext: {} as WorkspaceAuthContext,
    rolePermissionConfig: { intersectionOf: ['role-id'] },
    recordReadAttempt,
    context: 'context',
    onRecordReadGivenUp,
  });

describe('PendingWakeUpEventRecordService.decideOnEventRecord', () => {
  it('wakes the owner up with only what it can read of the record', async () => {
    expect(
      await decide({
        recordRead: {
          success: true,
          result: { records: [{ id: 'company-id', name: 'Acme' }] },
        },
      }),
    ).toEqual({
      type: 'RESOLVE',
      event: {
        ...EVENT,
        record: { id: 'company-id', name: 'Acme' },
        updatedFields: ['name'],
      },
      context: 'context',
    });
  });

  it('keeps waiting on a record the owner cannot read', async () => {
    expect(
      await decide({ recordRead: { success: true, result: { records: [] } } }),
    ).toEqual({
      type: 'IGNORE',
    });
  });

  it('tries a failed read again later', async () => {
    expect(
      await decide({ recordRead: { success: false }, recordReadAttempt: 2 }),
    ).toMatchObject({ type: 'RETRY_LATER', recordReadAttempt: 3 });
  });

  it('keeps waiting once the read kept failing, and says so', async () => {
    const onRecordReadGivenUp = jest.fn();

    expect(
      await decide({
        recordRead: { success: false, error: 'boom' },
        recordReadAttempt: 8,
        onRecordReadGivenUp,
      }),
    ).toEqual({ type: 'IGNORE' });
    expect(onRecordReadGivenUp).toHaveBeenCalledWith('boom');
  });
});
