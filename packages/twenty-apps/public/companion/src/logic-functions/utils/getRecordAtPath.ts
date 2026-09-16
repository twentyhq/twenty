import { asRecord } from 'src/logic-functions/utils/asRecord';

export const getRecordAtPath = (
  record: Record<string, unknown> | undefined,
  path: string[],
): unknown =>
  path.reduce<unknown>(
    (currentValue, pathPart) => asRecord(currentValue)?.[pathPart],
    record,
  );
