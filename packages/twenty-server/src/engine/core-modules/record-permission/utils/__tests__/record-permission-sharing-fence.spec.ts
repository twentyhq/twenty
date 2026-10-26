import { runWithRecordPermissionSharingFence } from 'src/engine/core-modules/record-permission/utils/run-with-record-permission-sharing-fence.util';
import { TwentyOrmExceptionCode } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

describe('Sharing publication fence', () => {
  jest.useRealTimers();

  it('releases the transaction before retrying contention and writes once', async () => {
    const transaction = {
      executeRawQuery: jest
        .fn()
        .mockResolvedValueOnce([{ acquired: false }])
        .mockResolvedValueOnce([{ acquired: true }]),
    };
    let transactionOpen = false;
    const work = jest.fn(async () => {
      expect(transactionOpen).toBe(true);
    });
    await runWithRecordPermissionSharingFence({
      schemaName: 'sharing_test',
      runInTransaction: async (callback) => {
        expect(transactionOpen).toBe(false);
        transactionOpen = true;
        try {
          await callback(transaction);
        } finally {
          transactionOpen = false;
        }
      },
      work,
    });

    expect(work).toHaveBeenCalledTimes(1);
    expect(transactionOpen).toBe(false);
  });

  it('fails closed after bounded contention without attempting a write', async () => {
    const transaction = {
      executeRawQuery: jest.fn().mockResolvedValue([{ acquired: false }]),
    };
    const work = jest.fn();
    const startedAt = Date.now();

    await expect(
      runWithRecordPermissionSharingFence({
        schemaName: 'sharing_test',
        runInTransaction: (callback) => callback(transaction),
        work,
      }),
    ).rejects.toMatchObject({
      code: TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR,
    });
    expect(work).not.toHaveBeenCalled();
    expect(Date.now() - startedAt).toBeLessThan(1000);
  });

  it('does not replay authorization or write failures after acquiring the fence', async () => {
    const transaction = {
      executeRawQuery: jest.fn().mockResolvedValue([{ acquired: true }]),
    };
    const error = new Error('Authorization changed');
    const work = jest.fn().mockRejectedValue(error);

    await expect(
      runWithRecordPermissionSharingFence({
        schemaName: 'sharing_test',
        runInTransaction: (callback) => callback(transaction),
        work,
      }),
    ).rejects.toBe(error);
    expect(work).toHaveBeenCalledTimes(1);
  });
});
