import type {
  MappedSourceRecord,
  SyncStatus,
  UpsertResult,
} from '../supabase-sync/types/mapped-source-record.type';
import type { TwentyClientLike } from '../supabase-sync/types/twenty-client-like.type';
import { extractMutationRecord } from '../supabase-sync/utils/extract-twenty-result';
import { findExistingTwentyRecord } from '../supabase-sync/utils/find-existing-twenty-record';
import { getTargetObjectApiNames } from '../supabase-sync/utils/object-api-names';
import {
  findSyncMap,
  updateExistingSyncMap,
  upsertSyncMap,
} from '../supabase-sync/utils/upsert-sync-map';

type FallbackLookup = (client: TwentyClientLike) => Promise<{ id: string } | null>;

const stripExternalId = (
  fieldValues: Record<string, unknown>,
  externalIdField: string,
): Record<string, unknown> =>
  Object.entries(fieldValues).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      if (key !== externalIdField) acc[key] = value;
      return acc;
    },
    {},
  );

const updateRecordById = async (
  client: TwentyClientLike,
  record: MappedSourceRecord,
  twentyRecordId: string,
  data: Record<string, unknown>,
): Promise<string> => {
  const apiNames = getTargetObjectApiNames(record.targetObject);
  const result = await client.mutation({
    [apiNames.updateMutationName]: {
      __args: { id: twentyRecordId, data },
      id: true,
    },
  });
  const updated = extractMutationRecord<{ id: string }>(
    result,
    apiNames.updateMutationName,
  );
  if (!updated?.id) {
    throw new Error(
      `Failed to update ${record.targetObject} ${twentyRecordId}`,
    );
  }
  return updated.id;
};

export const enrichTwentyRecord = async (
  client: TwentyClientLike,
  record: MappedSourceRecord,
  fallbackLookup?: FallbackLookup,
): Promise<UpsertResult> => {
  const existingSyncMap = await findSyncMap(client, record.syncKey);

  if (existingSyncMap?.targetRecordId) {
    if (existingSyncMap.payloadHash === record.contentHash) {
      await updateExistingSyncMap({
        client,
        syncMapId: existingSyncMap.id,
        record,
        targetRecordId: existingSyncMap.targetRecordId,
        status: 'SYNCED' as SyncStatus,
      });
      return {
        action: 'skipped',
        targetObject: record.targetObject,
        syncMapId: existingSyncMap.id,
      };
    }
  }

  let existing = await findExistingTwentyRecord({
    client,
    targetObject: record.targetObject,
    externalIdField: record.externalIdField,
    externalIdValue: record.externalIdValue,
  });

  if (!existing && fallbackLookup) {
    existing = await fallbackLookup(client);
  }

  if (!existing) {
    const syncMap = await upsertSyncMap({
      client,
      record,
      targetRecordId: null,
      status: 'SYNCED' as SyncStatus,
      errorSummary: 'No existing record found for enrichment',
    });
    return {
      action: 'skipped',
      targetObject: record.targetObject,
      syncMapId: syncMap.id,
    };
  }

  const updateData = stripExternalId(record.fieldValues, record.externalIdField);
  const updatedId = await updateRecordById(client, record, existing.id, updateData);

  const syncMap = await upsertSyncMap({
    client,
    record,
    targetRecordId: updatedId,
    status: 'SYNCED' as SyncStatus,
  });

  return {
    action: 'updated',
    targetObject: record.targetObject,
    twentyRecordId: updatedId,
    syncMapId: syncMap.id,
  };
};
