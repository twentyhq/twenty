import type {
  MappedSourceRecord,
  SyncStatus,
} from '../types/mapped-source-record.type';
import type { TwentyClientLike } from '../types/twenty-client-like.type';
import {
  extractConnection,
  extractMutationRecord,
  isUniqueViolationError,
} from './extract-twenty-result';

type SyncMapNode = {
  id: string;
  targetRecordId?: string | null;
  payloadHash?: string | null;
};

export type SyncMapUpsertInput = {
  client: TwentyClientLike;
  record: MappedSourceRecord;
  targetRecordId?: string | null;
  status: SyncStatus;
  errorSummary?: string | null;
};

export const findSyncMap = async (
  client: TwentyClientLike,
  syncKey: string,
): Promise<SyncMapNode | null> => {
  const result = await client.query({
    xopureSyncMaps: {
      __args: {
        filter: {
          syncKey: { eq: syncKey },
        },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          targetRecordId: true,
          payloadHash: true,
        },
      },
    },
  });

  const connection = extractConnection<SyncMapNode>(result, 'xopureSyncMaps');

  return connection.edges[0]?.node ?? null;
};

const buildSyncMapData = (params: SyncMapUpsertInput) => ({
  syncKey: params.record.syncKey,
  sourceSystem: params.record.sourceSystem,
  sourceSchema: params.record.sourceSchema,
  sourceTable: params.record.sourceTable,
  sourceRecordId: params.record.sourceRecordId,
  targetObject: params.record.targetObject,
  targetRecordId: params.targetRecordId ?? null,
  payloadHash: params.record.contentHash,
  lastStatus: params.status,
  lastSyncedAt: new Date().toISOString(),
  lastErrorSummary: params.errorSummary ?? null,
});

const createSyncMap = async (
  params: SyncMapUpsertInput,
): Promise<SyncMapNode> => {
  const result = await params.client.mutation({
    createXopureSyncMap: {
      __args: {
        data: buildSyncMapData(params),
      },
      id: true,
    },
  });

  const created = extractMutationRecord<SyncMapNode>(
    result,
    'createXopureSyncMap',
  );

  if (!created) {
    throw new Error(`Failed to create sync map for ${params.record.syncKey}`);
  }

  return created;
};

const updateSyncMap = async (params: {
  client: TwentyClientLike;
  syncMapId: string;
  data: Record<string, unknown>;
}): Promise<SyncMapNode> => {
  const result = await params.client.mutation({
    updateXopureSyncMap: {
      __args: {
        id: params.syncMapId,
        data: params.data,
      },
      id: true,
    },
  });

  const updated = extractMutationRecord<SyncMapNode>(
    result,
    'updateXopureSyncMap',
  );

  if (!updated) {
    throw new Error(`Failed to update sync map ${params.syncMapId}`);
  }

  return updated;
};

export const upsertSyncMap = async (
  params: SyncMapUpsertInput,
): Promise<SyncMapNode> => {
  const existing = await findSyncMap(params.client, params.record.syncKey);
  const data = buildSyncMapData(params);

  if (existing) {
    return updateSyncMap({
      client: params.client,
      syncMapId: existing.id,
      data,
    });
  }

  try {
    return await createSyncMap(params);
  } catch (error) {
    if (!isUniqueViolationError(error)) {
      throw error;
    }

    const raceWinner = await findSyncMap(params.client, params.record.syncKey);

    if (!raceWinner) {
      throw error;
    }

    return updateSyncMap({
      client: params.client,
      syncMapId: raceWinner.id,
      data,
    });
  }
};

export const updateExistingSyncMap = async (params: {
  client: TwentyClientLike;
  syncMapId: string;
  record: MappedSourceRecord;
  targetRecordId?: string | null;
  status: SyncStatus;
  errorSummary?: string | null;
}): Promise<SyncMapNode> =>
  updateSyncMap({
    client: params.client,
    syncMapId: params.syncMapId,
    data: buildSyncMapData({
      client: params.client,
      record: params.record,
      targetRecordId: params.targetRecordId,
      status: params.status,
      errorSummary: params.errorSummary,
    }),
  });
