import type {
  MappedSourceRecord,
  UpsertResult,
} from '../types/mapped-source-record.type';
import type { TwentyClientLike } from '../types/twenty-client-like.type';
import { extractMutationRecord } from './extract-twenty-result';
import { findExistingTwentyRecord } from './find-existing-twenty-record';
import { getTargetObjectApiNames } from './object-api-names';
import { resolveXopureRelations } from './resolve-xopure-relations';
import {
  findSyncMap,
  updateExistingSyncMap,
  upsertSyncMap,
} from './upsert-sync-map';

const stripImmutableExternalId = (
  fieldValues: Record<string, unknown>,
  externalIdField: string,
): Record<string, unknown> =>
  Object.entries(fieldValues).reduce<Record<string, unknown>>(
    (accumulator, [key, value]) => {
      if (key !== externalIdField) {
        accumulator[key] = value;
      }

      return accumulator;
    },
    {},
  );

const createTargetRecord = async (params: {
  client: TwentyClientLike;
  record: MappedSourceRecord;
  data: Record<string, unknown>;
}): Promise<string> => {
  const apiNames = getTargetObjectApiNames(params.record.targetObject);
  const result = await params.client.mutation({
    [apiNames.createMutationName]: {
      __args: {
        data: params.data,
      },
      id: true,
    },
  });
  const created = extractMutationRecord<{ id: string }>(
    result,
    apiNames.createMutationName,
  );

  if (!created?.id) {
    throw new Error(`Failed to create ${params.record.targetObject}`);
  }

  return created.id;
};

const updateTargetRecord = async (params: {
  client: TwentyClientLike;
  record: MappedSourceRecord;
  twentyRecordId: string;
  data: Record<string, unknown>;
}): Promise<string> => {
  const apiNames = getTargetObjectApiNames(params.record.targetObject);
  const result = await params.client.mutation({
    [apiNames.updateMutationName]: {
      __args: {
        id: params.twentyRecordId,
        data: params.data,
      },
      id: true,
    },
  });
  const updated = extractMutationRecord<{ id: string }>(
    result,
    apiNames.updateMutationName,
  );

  if (!updated?.id) {
    throw new Error(
      `Failed to update ${params.record.targetObject} ${params.twentyRecordId}`,
    );
  }

  return updated.id;
};

export const upsertTwentyRecord = async (
  client: TwentyClientLike,
  record: MappedSourceRecord,
): Promise<UpsertResult> => {
  const relationResolution = await resolveXopureRelations({
    client,
    relations: record.relations,
  });

  if (!relationResolution.ok) {
    const syncMap = await upsertSyncMap({
      client,
      record,
      targetRecordId: null,
      status: 'FAILED_RETRYABLE',
      errorSummary: relationResolution.message,
    });

    return {
      action: 'failed',
      targetObject: record.targetObject,
      syncMapId: syncMap.id,
      retryable: true,
      errorCode: relationResolution.code,
      errorMessage: relationResolution.message,
    };
  }

  const fieldValuesWithRelations = {
    ...record.fieldValues,
    ...relationResolution.relationFieldValues,
  };
  const existingSyncMap = await findSyncMap(client, record.syncKey);

  if (existingSyncMap?.targetRecordId) {
    if (existingSyncMap.payloadHash === record.contentHash) {
      const syncMap = await updateExistingSyncMap({
        client,
        syncMapId: existingSyncMap.id,
        record,
        targetRecordId: existingSyncMap.targetRecordId,
        status: 'SYNCED',
      });

      return {
        action: 'skipped',
        targetObject: record.targetObject,
        twentyRecordId: existingSyncMap.targetRecordId,
        syncMapId: syncMap.id,
      };
    }

    const updateData = stripImmutableExternalId(
      fieldValuesWithRelations,
      record.externalIdField,
    );
    const twentyRecordId = await updateTargetRecord({
      client,
      record,
      twentyRecordId: existingSyncMap.targetRecordId,
      data: updateData,
    });
    const syncMap = await updateExistingSyncMap({
      client,
      syncMapId: existingSyncMap.id,
      record,
      targetRecordId: twentyRecordId,
      status: 'SYNCED',
    });

    return {
      action: 'updated',
      targetObject: record.targetObject,
      twentyRecordId,
      syncMapId: syncMap.id,
    };
  }

  const existingRecord = await findExistingTwentyRecord({
    client,
    targetObject: record.targetObject,
    externalIdField: record.externalIdField,
    externalIdValue: record.externalIdValue,
  });

  if (existingRecord) {
    const updateData = stripImmutableExternalId(
      fieldValuesWithRelations,
      record.externalIdField,
    );
    const twentyRecordId = await updateTargetRecord({
      client,
      record,
      twentyRecordId: existingRecord.id,
      data: updateData,
    });
    const syncMap = await upsertSyncMap({
      client,
      record,
      targetRecordId: twentyRecordId,
      status: 'SYNCED',
    });

    return {
      action: 'updated',
      targetObject: record.targetObject,
      twentyRecordId,
      syncMapId: syncMap.id,
    };
  }

  const twentyRecordId = await createTargetRecord({
    client,
    record,
    data: fieldValuesWithRelations,
  });
  const syncMap = await upsertSyncMap({
    client,
    record,
    targetRecordId: twentyRecordId,
    status: 'SYNCED',
  });

  return {
    action: 'created',
    targetObject: record.targetObject,
    twentyRecordId,
    syncMapId: syncMap.id,
  };
};
