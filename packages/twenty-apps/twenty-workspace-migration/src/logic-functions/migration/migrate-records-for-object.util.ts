import { AxiosInstance } from "axios";
import { fieldsToOmitFromRecordMigration } from "src/constants/to-omit";
import { buildRecordFieldPlan } from "src/logic-functions/utils/build-record-field-plan.util";
import { findManyRecords } from "src/logic-functions/requests/find-many-records.util";
import { createManyRecords } from "src/logic-functions/requests/create-many-records.util";
import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";
import { buildRecordDataToCreate, type DroppedRelationCounts } from "src/logic-functions/utils/build-record-data-to-create.util";
import { migrationState } from "src/logic-functions/utils/migration-state.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { setObjectCursor } from "src/logic-functions/utils/set-object-cursor.util";

export const migrateRecordsForObject = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  sourceObject: ObjectType,
  recordIdMap: Map<string, string>,
): Promise<true | void> => {
  const plan = buildRecordFieldPlan(sourceObject.fieldsList, fieldsToOmitFromRecordMigration);
  const enumDataKeys = new Set(plan.enumDataKeys);
  const relationForeignKeyNames = new Set(plan.relationForeignKeyNames);

  let after: string | null = migrationState.objectRecordsToMigrate.get(sourceObject.namePlural) ?? null;
  let migratedRecords = 0;

  while (true) {
    const page = await executeWithRetry(() => findManyRecords(sourceWorkspace, sourceObject.namePlural, plan.selectionSet, after));
    const nodes = page.edges.map((edge) => edge.node);

    if (nodes.length > 0) {
      const droppedRelationCounts: DroppedRelationCounts = new Map();
      const dataToCreate = nodes.map((node) =>
        buildRecordDataToCreate(node, plan.dataKeys, relationForeignKeyNames, recordIdMap, droppedRelationCounts),
      );
      const created = await executeWithRetryAndCheckpoint(() =>
        createManyRecords(targetWorkspace, sourceObject.namePlural, dataToCreate, enumDataKeys),
      );

      nodes.forEach((node, index) => {
        recordIdMap.set(node.id as string, created[index].id);
      });
      migratedRecords += nodes.length;

      for (const [foreignKeyName, count] of droppedRelationCounts) {
        logger.warn(`Dropped "${foreignKeyName}" on ${count} ${sourceObject.nameSingular} record(s) in this page: referenced record not migrated yet`);
      }
    }

    if (!page.pageInfo.hasNextPage) {
      setObjectCursor(sourceObject.namePlural, null);
      break;
    }
    after = page.pageInfo.endCursor;
    setObjectCursor(sourceObject.namePlural, after);
    if (await stopIfTimeBudgetExceeded()) {
      return true;
    }
  }

  logger.log(`Migrated ${migratedRecords} record(s) for ${sourceObject.nameSingular}`);
};