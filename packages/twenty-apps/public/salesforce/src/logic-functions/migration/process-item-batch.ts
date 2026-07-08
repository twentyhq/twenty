import { type CoreApiClient } from 'twenty-client-sdk/core';

import { mapSalesforceRecord } from 'src/logic-functions/migration/map-salesforce-records';
import { buildBatchSoql } from 'src/logic-functions/migration/migration-object-definitions';
import {
  type BatchResult,
  type MappedRecord,
  type MappingContext,
  type MigrationObjectDefinition,
  type RecordFailure,
  type SalesforceRecord,
  type TargetRef,
} from 'src/logic-functions/migration/migration-types';
import { type SalesforceClient } from 'src/logic-functions/salesforce/salesforce-client';
import { getErrorMessage } from 'src/logic-functions/salesforce/salesforce-errors';
import {
  createRecordsWithFallback,
  findRecordIdsBySalesforceIds,
  updateRecords,
} from 'src/logic-functions/migration/twenty-records';

const TARGET_KIND_TO_OBJECT: Record<
  TargetRef['targetKind'],
  { plural: string; joinField: string }
> = {
  person: { plural: 'people', joinField: 'personId' },
  company: { plural: 'companies', joinField: 'companyId' },
  opportunity: { plural: 'opportunities', joinField: 'opportunityId' },
};

const resolveCompanyReferences = async ({
  client,
  mappedRecords,
}: {
  client: CoreApiClient;
  mappedRecords: MappedRecord[];
}): Promise<void> => {
  const companyRefs = mappedRecords
    .map((mappedRecord) => mappedRecord.companyRef)
    .filter((companyRef): companyRef is string => companyRef !== undefined);

  if (companyRefs.length === 0) {
    return;
  }

  const companyIdBySalesforceId = await findRecordIdsBySalesforceIds({
    client,
    objectNamePlural: 'companies',
    salesforceIds: companyRefs,
  });

  for (const mappedRecord of mappedRecords) {
    if (mappedRecord.companyRef === undefined) {
      continue;
    }

    const companyId = companyIdBySalesforceId.get(mappedRecord.companyRef);

    if (companyId !== undefined) {
      mappedRecord.data.companyId = companyId;
    }
  }
};

// Attaches created tasks/notes to their people, companies, and opportunities.
// Targets are only created alongside a freshly created parent record, which
// keeps re-runs from duplicating them.
const createActivityTargets = async ({
  client,
  definition,
  mappedRecords,
  createdIdBySalesforceId,
}: {
  client: CoreApiClient;
  definition: MigrationObjectDefinition;
  mappedRecords: MappedRecord[];
  createdIdBySalesforceId: Map<string, string>;
}): Promise<void> => {
  if (definition.key !== 'task' && definition.key !== 'note') {
    return;
  }

  const refsByKind = new Map<TargetRef['targetKind'], string[]>();

  for (const mappedRecord of mappedRecords) {
    if (!createdIdBySalesforceId.has(mappedRecord.salesforceId)) {
      continue;
    }

    for (const targetRef of mappedRecord.targetRefs ?? []) {
      const refs = refsByKind.get(targetRef.targetKind) ?? [];

      refs.push(targetRef.salesforceId);
      refsByKind.set(targetRef.targetKind, refs);
    }
  }

  if (refsByKind.size === 0) {
    return;
  }

  const resolvedIdsByKind = new Map<
    TargetRef['targetKind'],
    Map<string, string>
  >();

  for (const [targetKind, salesforceIds] of refsByKind) {
    resolvedIdsByKind.set(
      targetKind,
      await findRecordIdsBySalesforceIds({
        client,
        objectNamePlural: TARGET_KIND_TO_OBJECT[targetKind].plural,
        salesforceIds,
      }),
    );
  }

  const parentJoinField = definition.key === 'task' ? 'taskId' : 'noteId';
  const targetsToCreate: Record<string, string>[] = [];

  for (const mappedRecord of mappedRecords) {
    const parentId = createdIdBySalesforceId.get(mappedRecord.salesforceId);

    if (parentId === undefined) {
      continue;
    }

    for (const targetRef of mappedRecord.targetRefs ?? []) {
      const resolvedId = resolvedIdsByKind
        .get(targetRef.targetKind)
        ?.get(targetRef.salesforceId);

      if (resolvedId !== undefined) {
        targetsToCreate.push({
          [parentJoinField]: parentId,
          [TARGET_KIND_TO_OBJECT[targetRef.targetKind].joinField]: resolvedId,
        });
      }
    }
  }

  if (targetsToCreate.length === 0) {
    return;
  }

  const mutationName =
    definition.key === 'task' ? 'createTaskTargets' : 'createNoteTargets';

  try {
    await client.mutation({
      [mutationName]: {
        __args: { data: targetsToCreate },
        id: true,
      },
    });
  } catch (error) {
    // Missing targets are non-fatal: the task/note itself migrated fine.
    console.error(
      `Could not create ${targetsToCreate.length} ${mutationName}: ${getErrorMessage(error)}`,
    );
  }
};

export const processItemBatch = async ({
  client,
  salesforceClient,
  definition,
  lastProcessedId,
  batchSize,
  mappingContext,
}: {
  client: CoreApiClient;
  salesforceClient: SalesforceClient;
  definition: MigrationObjectDefinition;
  lastProcessedId: string | null;
  batchSize: number;
  mappingContext: MappingContext;
}): Promise<BatchResult> => {
  const soql = buildBatchSoql({ definition, lastProcessedId, batchSize });
  const queryResult = await salesforceClient.query<SalesforceRecord>(soql);
  const records = queryResult.records;

  if (records.length === 0) {
    return {
      fetched: 0,
      created: 0,
      updated: 0,
      failed: 0,
      lastProcessedId,
      failures: [],
    };
  }

  const failures: RecordFailure[] = [];
  const mappedRecords: MappedRecord[] = [];

  for (const record of records) {
    try {
      mappedRecords.push(
        mapSalesforceRecord(definition.key, record, mappingContext),
      );
    } catch (error) {
      failures.push({
        salesforceId: record.Id,
        salesforceObject: definition.salesforceObject,
        message: `Mapping failed: ${getErrorMessage(error)}`,
        recordData: record,
      });
    }
  }

  await resolveCompanyReferences({ client, mappedRecords });

  const existingIdBySalesforceId = await findRecordIdsBySalesforceIds({
    client,
    objectNamePlural: definition.targetObjectPlural,
    salesforceIds: mappedRecords.map((mappedRecord) => mappedRecord.salesforceId),
  });

  const recordsToCreate = mappedRecords.filter(
    (mappedRecord) => !existingIdBySalesforceId.has(mappedRecord.salesforceId),
  );
  const recordsToUpdate = mappedRecords
    .filter((mappedRecord) =>
      existingIdBySalesforceId.has(mappedRecord.salesforceId),
    )
    .map((mappedRecord) => ({
      recordId: existingIdBySalesforceId.get(mappedRecord.salesforceId) as string,
      salesforceId: mappedRecord.salesforceId,
      data: mappedRecord.data,
    }));

  const createResult = await createRecordsWithFallback({
    client,
    objectNameSingular: definition.targetObjectSingular,
    objectNamePlural: definition.targetObjectPlural,
    salesforceObject: definition.salesforceObject,
    records: recordsToCreate,
  });

  failures.push(...createResult.failures);

  const updateResult = await updateRecords({
    client,
    objectNameSingular: definition.targetObjectSingular,
    salesforceObject: definition.salesforceObject,
    records: recordsToUpdate,
  });

  failures.push(...updateResult.failures);

  await createActivityTargets({
    client,
    definition,
    mappedRecords,
    createdIdBySalesforceId: createResult.createdIdBySalesforceId,
  });

  return {
    fetched: records.length,
    created: createResult.createdIdBySalesforceId.size,
    updated: updateResult.updatedCount,
    failed: failures.length,
    lastProcessedId: records[records.length - 1].Id,
    failures,
  };
};
