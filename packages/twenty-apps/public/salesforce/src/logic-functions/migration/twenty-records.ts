import { type CoreApiClient } from 'twenty-client-sdk/core';

import { getErrorMessage } from 'src/logic-functions/salesforce/salesforce-errors';
import { type RecordFailure } from 'src/logic-functions/migration/migration-types';

const LOOKUP_CHUNK_SIZE = 100;
const ERROR_MESSAGE_MAX_LENGTH = 800;

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const chunk = <TItem>(items: TItem[], size: number): TItem[][] => {
  const chunks: TItem[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

// Maps Salesforce Ids to existing Twenty record ids for a given object. This
// lookup is what makes every write an idempotent upsert.
export const findRecordIdsBySalesforceIds = async ({
  client,
  objectNamePlural,
  salesforceIds,
}: {
  client: CoreApiClient;
  objectNamePlural: string;
  salesforceIds: string[];
}): Promise<Map<string, string>> => {
  const recordIdBySalesforceId = new Map<string, string>();
  const uniqueSalesforceIds = [...new Set(salesforceIds)];

  for (const idsChunk of chunk(uniqueSalesforceIds, LOOKUP_CHUNK_SIZE)) {
    const response = await client.query({
      [objectNamePlural]: {
        __args: {
          filter: { salesforceId: { in: idsChunk } },
          first: idsChunk.length,
        },
        edges: { node: { id: true, salesforceId: true } },
      },
    });

    const edges =
      (response as Record<string, any>)[objectNamePlural]?.edges ?? [];

    for (const edge of edges) {
      if (edge?.node?.salesforceId && edge?.node?.id) {
        recordIdBySalesforceId.set(edge.node.salesforceId, edge.node.id);
      }
    }
  }

  return recordIdBySalesforceId;
};

export type CreateRecordsResult = {
  createdIdBySalesforceId: Map<string, string>;
  failures: RecordFailure[];
};

// Creates records in one batch mutation, falling back to per-record creates
// when the batch fails so a single bad record cannot poison a whole batch.
export const createRecordsWithFallback = async ({
  client,
  objectNameSingular,
  objectNamePlural,
  salesforceObject,
  records,
}: {
  client: CoreApiClient;
  objectNameSingular: string;
  objectNamePlural: string;
  salesforceObject: string;
  records: { salesforceId: string; data: Record<string, unknown> }[];
}): Promise<CreateRecordsResult> => {
  const createdIdBySalesforceId = new Map<string, string>();
  const failures: RecordFailure[] = [];

  if (records.length === 0) {
    return { createdIdBySalesforceId, failures };
  }

  const batchMutationName = `create${capitalize(objectNamePlural)}`;

  try {
    const response = await client.mutation({
      [batchMutationName]: {
        __args: { data: records.map((record) => record.data) },
        id: true,
        salesforceId: true,
      },
    });

    const createdRecords =
      ((response as Record<string, any>)[batchMutationName] as {
        id: string;
        salesforceId: string;
      }[]) ?? [];

    for (const createdRecord of createdRecords) {
      createdIdBySalesforceId.set(createdRecord.salesforceId, createdRecord.id);
    }

    return { createdIdBySalesforceId, failures };
  } catch {
    // Batch failed: retry one by one to isolate the failing records.
  }

  const singleMutationName = `create${capitalize(objectNameSingular)}`;

  for (const record of records) {
    try {
      const response = await client.mutation({
        [singleMutationName]: {
          __args: { data: record.data },
          id: true,
          salesforceId: true,
        },
      });

      const createdRecord = (response as Record<string, any>)[
        singleMutationName
      ] as { id: string } | undefined;

      if (createdRecord?.id) {
        createdIdBySalesforceId.set(record.salesforceId, createdRecord.id);
      }
    } catch (error) {
      failures.push({
        salesforceId: record.salesforceId,
        salesforceObject,
        message: getErrorMessage(error),
        recordData: record.data,
      });
    }
  }

  return { createdIdBySalesforceId, failures };
};

export const updateRecords = async ({
  client,
  objectNameSingular,
  salesforceObject,
  records,
}: {
  client: CoreApiClient;
  objectNameSingular: string;
  salesforceObject: string;
  records: {
    recordId: string;
    salesforceId: string;
    data: Record<string, unknown>;
  }[];
}): Promise<{ updatedCount: number; failures: RecordFailure[] }> => {
  const failures: RecordFailure[] = [];
  let updatedCount = 0;
  const mutationName = `update${capitalize(objectNameSingular)}`;

  for (const record of records) {
    try {
      await client.mutation({
        [mutationName]: {
          __args: { id: record.recordId, data: record.data },
          id: true,
        },
      });
      updatedCount += 1;
    } catch (error) {
      failures.push({
        salesforceId: record.salesforceId,
        salesforceObject,
        message: getErrorMessage(error),
        recordData: record.data,
      });
    }
  }

  return { updatedCount, failures };
};

export const storeMigrationErrors = async ({
  client,
  migrationId,
  failures,
  capacity,
}: {
  client: CoreApiClient;
  migrationId: string;
  failures: RecordFailure[];
  capacity: number;
}): Promise<void> => {
  const failuresToStore = failures.slice(0, Math.max(capacity, 0));

  if (failuresToStore.length === 0) {
    return;
  }

  try {
    await client.mutation({
      createSalesforceMigrationErrors: {
        __args: {
          data: failuresToStore.map((failure) => ({
            name: `${failure.salesforceObject} ${failure.salesforceId}`,
            migrationId,
            salesforceObject: failure.salesforceObject,
            salesforceRecordId: failure.salesforceId,
            message: failure.message.slice(0, ERROR_MESSAGE_MAX_LENGTH),
            recordData: failure.recordData,
          })),
        },
        id: true,
      },
    });
  } catch (error) {
    // Failing to persist error details must never fail the migration itself.
    console.error(
      `Could not store ${failuresToStore.length} migration error records: ${getErrorMessage(error)}`,
    );
  }
};
