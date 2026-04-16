import type { UpsertRecordsOptions } from 'src/types/upsert-records-options';
import type { SyncResult } from 'src/types/sync-result';
import { upsertRecord } from 'src/utils/upsert-record';
import { withRateLimitRetry } from 'src/utils/with-rate-limit-retry';

export const upsertRecords = async <TListItem, TDetail = TListItem>(
  options: UpsertRecordsOptions<TListItem, TDetail>,
): Promise<SyncResult> => {
  const {
    items,
    getId,
    fetchDetail,
    mapCreateData,
    mapUpdateData,
    existingMap,
    client,
    objectNameSingular,
  } = options;

  const result: SyncResult = {
    fetched: items.length,
    created: 0,
    updated: 0,
    errors: [],
  };

  for (const item of items) {
    const resendId = getId(item);

    try {
      const isNew = !existingMap.has(resendId);

      const detail = fetchDetail
        ? await withRateLimitRetry(() => fetchDetail(resendId))
        : (item as unknown as TDetail);

      if (isNew) {
        const data = mapCreateData(detail, item);
        await withRateLimitRetry(() =>
          upsertRecord(client, objectNameSingular, existingMap, resendId, data),
        );
        result.created++;
      } else {
        const data = mapUpdateData(detail, item);
        await withRateLimitRetry(() =>
          upsertRecord(client, objectNameSingular, existingMap, resendId, data),
        );
        result.updated++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      result.errors.push(`${objectNameSingular} ${resendId}: ${message}`);
    }
  }

  return result;
};
