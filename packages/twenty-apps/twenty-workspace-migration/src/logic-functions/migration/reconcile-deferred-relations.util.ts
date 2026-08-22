import { AxiosInstance } from "axios";
import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";
import { fieldsToOmitFromRecordMigration } from "src/constants/to-omit";
import { buildRecordFieldPlan } from "src/logic-functions/utils/build-record-field-plan.util";
import { findManyRecords } from "src/logic-functions/requests/find-many-records.util";
import { updateOneRecord } from "src/logic-functions/requests/update-one-record.util";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { migrationState, setStateRef } from "src/logic-functions/utils/migration-state.util";
import { setObjectCursor } from "src/logic-functions/utils/set-object-cursor.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { RecordIdResolution, resolveTargetRecordId } from "src/logic-functions/utils/record-id-resolution.util";

// Namespaced so a reconciliation cursor can't collide with the migration cursor for the same
// object, which lives in the same map.
const cursorKeyFor = (namePlural: string): string => `reconcile:${namePlural}`;

// Records are inserted object by object, page by page, so a foreign key pointing at a record
// that doesn't exist yet gets dropped rather than failing the insert. Ordering by dependency
// fixes that for most relations, but two cases can't be ordered away: a self-reference (a
// parent/child hierarchy inside one object) and a dependency cycle between objects, which the
// sort has to break somewhere. This pass revisits exactly those foreign keys once every record
// exists and writes back the ones that now resolve.
const findDeferredForeignKeyNames = (
  sourceObject: ObjectType,
  objectIndex: number,
  orderIndexByNameSingular: Map<string, number>,
): string[] => {
  const plan = buildRecordFieldPlan(sourceObject.fieldsList, fieldsToOmitFromRecordMigration);

  return plan.relationForeignKeyNames.filter((foreignKeyName) => {
    const targetNameSingular = plan.relationTargetNameSingularByForeignKeyName.get(foreignKeyName);
    if (targetNameSingular === undefined) {
      return false;
    }
    const targetIndex = orderIndexByNameSingular.get(targetNameSingular);
    // Targets migrated strictly earlier were all present by the time this object was inserted,
    // and targets absent from the order entirely (workspace members, dashboards) are resolved
    // through their own stage rather than here.
    return targetIndex !== undefined && targetIndex >= objectIndex;
  });
};

export const reconcileDeferredRelations = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  recordMigrationOrder: ObjectType[],
  recordIds: RecordIdResolution,
): Promise<boolean> => {
  const orderIndexByNameSingular = new Map(
    recordMigrationOrder.map((object, index) => [object.nameSingular, index]),
  );
  let patchedRecords = 0;

  for (const [objectIndex, sourceObject] of recordMigrationOrder.entries()) {
    if (objectIndex < migrationState.reconciliationObjectIndex) {
      continue;
    }

    const deferredForeignKeyNames = findDeferredForeignKeyNames(sourceObject, objectIndex, orderIndexByNameSingular);
    if (deferredForeignKeyNames.length === 0) {
      setStateRef('reconciliationObjectIndex', objectIndex + 1);
      continue;
    }

    const cursorKey = cursorKeyFor(sourceObject.namePlural);
    let after: string | null = migrationState.objectRecordsToMigrate.get(cursorKey) ?? null;

    while (true) {
      const page = await executeWithRetry(() =>
        findManyRecords(sourceWorkspace, sourceObject.namePlural, deferredForeignKeyNames.join('\n'), after),
      );

      for (const edge of page.edges) {
        const targetRecordId = resolveTargetRecordId(recordIds, edge.node.id as string);
        if (targetRecordId === undefined) {
          continue;
        }

        const data: Record<string, unknown> = {};
        for (const foreignKeyName of deferredForeignKeyNames) {
          const sourceTargetId = edge.node[foreignKeyName];
          if (sourceTargetId === null || sourceTargetId === undefined) {
            continue;
          }
          const resolvedTargetId = resolveTargetRecordId(recordIds, sourceTargetId as string);
          if (resolvedTargetId !== undefined) {
            data[foreignKeyName] = resolvedTargetId;
          }
        }

        if (Object.keys(data).length === 0) {
          continue;
        }

        try {
          await executeWithRetryAndCheckpoint(() =>
            updateOneRecord(targetWorkspace, sourceObject.nameSingular, targetRecordId, data),
          );
          patchedRecords += 1;
        } catch (error) {
          logger.warn(`Could not reconcile relations on ${sourceObject.nameSingular} ${targetRecordId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      if (page.pageInfo.hasNextPage === false) {
        setObjectCursor(cursorKey, null);
        break;
      }
      after = page.pageInfo.endCursor;
      setObjectCursor(cursorKey, after);
      if (await stopIfTimeBudgetExceeded()) {
        return false;
      }
    }

    setStateRef('reconciliationObjectIndex', objectIndex + 1);
    if (await stopIfTimeBudgetExceeded()) {
      return false;
    }
  }

  if (patchedRecords > 0) {
    logger.log(`Reconciled deferred relations on ${patchedRecords} record(s)`);
  }
  return true;
};
