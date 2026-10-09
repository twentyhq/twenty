import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { describe, expect, it, vi } from 'vitest';

import { createRecordsWithPerRecordFallback } from 'src/logic-functions/utils/create-records-with-per-record-fallback.util';

const RECORDS = ['first', 'second', 'third'];

describe('createRecordsWithPerRecordFallback', () => {
  it('creates several records in one batch', async () => {
    const createRecords = vi.fn().mockResolvedValue({});
    const createRecord = vi.fn();

    expect(
      await createRecordsWithPerRecordFallback({
        records: RECORDS,
        createRecords,
        createRecord,
      }),
    ).toEqual(RECORDS);
    expect(createRecords).toHaveBeenCalledExactlyOnceWith(RECORDS);
    expect(createRecord).not.toHaveBeenCalled();
  });

  it('falls back to one create per record and returns only the records it created', async () => {
    const createRecord = vi.fn(async (record: string) => record !== 'second');

    expect(
      await createRecordsWithPerRecordFallback({
        records: RECORDS,
        createRecords: vi.fn().mockRejectedValue(new Error('duplicate key')),
        createRecord,
      }),
    ).toEqual(['first', 'third']);
    expect(createRecord).toHaveBeenCalledTimes(3);
  });

  it('rethrows a retryable batch failure without falling back', async () => {
    const createRecord = vi.fn();

    await expect(
      createRecordsWithPerRecordFallback({
        records: RECORDS,
        createRecords: vi
          .fn()
          .mockRejectedValue(new RetryableLogicFunctionError('rate limited')),
        createRecord,
      }),
    ).rejects.toBeInstanceOf(RetryableLogicFunctionError);
    expect(createRecord).not.toHaveBeenCalled();
  });
});
