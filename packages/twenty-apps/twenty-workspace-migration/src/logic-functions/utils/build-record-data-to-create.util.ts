import { logger } from "src/logic-functions/utils/logger.util";

export const buildRecordDataToCreate = (
  node: Record<string, unknown>,
  dataKeys: string[],
  relationForeignKeyNames: string[],
  recordIdMap: Map<string, string>,
): Record<string, unknown> => {
  const data: Record<string, unknown> = {};

  for (const key of dataKeys) {
    if (relationForeignKeyNames.includes(key)) {
      const sourceRecordId = node[key];
      if (sourceRecordId === null || sourceRecordId === undefined) {
        data[key] = null;
        continue;
      }
      const targetRecordId = recordIdMap.get(sourceRecordId as string);
      if (targetRecordId === undefined) {
        logger.warn(`Dropping relation "${key}": referenced record ${sourceRecordId as string} was not migrated`);
        continue;
      }
      data[key] = targetRecordId;
      continue;
    }
    data[key] = node[key];
  }

  return data;
};