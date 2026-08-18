import { AxiosInstance } from "axios";
import { fieldsToOmitFromRecordMigration } from "src/constants/to-omit";
import { buildRecordFieldPlan } from "src/logic-functions/utils/build-record-field-plan.util";
import { findManyRecords } from "src/logic-functions/requests/find-many-records.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createManyRecords } from "src/logic-functions/requests/create-many-records.util";
import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";
import { buildRecordDataToCreate } from "src/logic-functions/utils/build-record-data-to-create.util";

export const migrateRecordsForObject = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  sourceObject: ObjectType,
  recordIdMap: Map<string, string>,
) => {
  const plan = buildRecordFieldPlan(sourceObject.fieldsList, fieldsToOmitFromRecordMigration);
  const enumDataKeys = new Set(plan.enumDataKeys);

  let after: string | null = null;
  let migratedCount = 0;

  while (true) {
    const page = await findManyRecords(sourceWorkspace, sourceObject.namePlural, plan.selectionSet, after);
    const nodes = page.edges.map((edge) => edge.node);

    if (nodes.length > 0) {
      const dataToCreate = nodes.map((node) =>
        buildRecordDataToCreate(node, plan.dataKeys, plan.relationForeignKeyNames, recordIdMap),
      );
      const created = await executeWithRetryAndCheckpoint(() =>
        createManyRecords(targetWorkspace, sourceObject.namePlural, dataToCreate, enumDataKeys),
      );

      // createMany returns records in the same order as the input array (a single
      // multi-row INSERT...RETURNING), so source/target ids can be zipped by index.
      nodes.forEach((node, index) => {
        recordIdMap.set(node.id as string, created[index].id);
      });
      migratedCount += nodes.length;
    }

    if (!page.pageInfo.hasNextPage) {
      break;
    }
    after = page.pageInfo.endCursor;
  }

  console.log(`Migrated ${migratedCount} record(s) for ${sourceObject.nameSingular}`);
};