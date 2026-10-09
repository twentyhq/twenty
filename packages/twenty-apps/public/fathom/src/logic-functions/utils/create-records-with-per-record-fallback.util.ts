import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

export const createRecordsWithPerRecordFallback = async <TRecord>({
  records,
  createRecords,
  createRecord,
}: {
  records: TRecord[];
  createRecords: (records: TRecord[]) => Promise<unknown>;
  createRecord: (record: TRecord) => Promise<boolean>;
}): Promise<TRecord[]> => {
  if (records.length > 1) {
    try {
      await createRecords(records);

      return records;
    } catch (error) {
      if (error instanceof RetryableLogicFunctionError) {
        throw error;
      }
    }
  }

  const createdRecords: TRecord[] = [];

  for (const record of records) {
    if (await createRecord(record)) {
      createdRecords.push(record);
    }
  }

  return createdRecords;
};
