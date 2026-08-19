import { AxiosInstance } from "axios";
import { fieldsToOmitFromRecordMigration } from "src/constants/to-omit";
import { buildRecordFieldPlan } from "src/logic-functions/utils/build-record-field-plan.util";
import { findManyRecords } from "src/logic-functions/requests/find-many-records.util";
import { createManyRecords } from "src/logic-functions/requests/create-many-records.util";
import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";
import { buildRecordDataToCreate } from "src/logic-functions/utils/build-record-data-to-create.util";
import { migrationState, setStateRef } from "src/logic-functions/utils/migration-state.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { PAGE_SIZE } from "src/constants/page-size";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";

const setObjectCursor = (namePlural: string, after: string | null): void => {
  const objectRecordsToMigrate = new Map(migrationState.objectRecordsToMigrate);
  if (after === null) {
    objectRecordsToMigrate.delete(namePlural);
  } else {
    objectRecordsToMigrate.set(namePlural, after);
  }
  setStateRef('objectRecordsToMigrate', objectRecordsToMigrate);
};

export const migrateRecordsForObject = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  sourceObject: ObjectType,
  recordIdMap: Map<string, string>,
) => {
  const plan = buildRecordFieldPlan(sourceObject.fieldsList, fieldsToOmitFromRecordMigration);
  const enumDataKeys = new Set(plan.enumDataKeys);

  let after: string | null = migrationState.objectRecordsToMigrate.get(sourceObject.namePlural) ?? null;
  let migratedCount = 0;

  while (true) {
    const page = await findManyRecords(sourceWorkspace, sourceObject.namePlural, plan.selectionSet, after);
    const nodes = page.edges.map((edge) => edge.node);

    if (nodes.length > 0) {
      const dataToCreate = nodes.map((node) =>
        buildRecordDataToCreate(node, plan.dataKeys, plan.relationForeignKeyNames, recordIdMap),
      );
      const created = await executeWithRetry(() =>
        createManyRecords(targetWorkspace, sourceObject.namePlural, dataToCreate, enumDataKeys),
      );

      nodes.forEach((node, index) => {
        recordIdMap.set(node.id as string, created[index].id);
      });
      migratedCount += nodes.length;
    }

    if (!page.pageInfo.hasNextPage) {
      setObjectCursor(sourceObject.namePlural, null);
      break;
    }
    after = page.pageInfo.endCursor;
    setObjectCursor(sourceObject.namePlural, after);
    if (migratedCount % (PAGE_SIZE * migrationState.maxRequests) === 0) {
      await stopIfTimeBudgetExceeded();
    }
  }

  logger.log(`Migrated ${migratedCount} record(s) for ${sourceObject.nameSingular}`);
};