import { createRecordPermissionIndex } from 'src/engine/core-modules/record-permission/utils/create-record-permission-index.util';
import { createHash } from 'node:crypto';

import { type RecordPermissionContext } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { type RecordPermissionDatabase } from 'src/engine/core-modules/record-permission/types/record-permission-database.type';
import { resolveRecordPermissionPath } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-path.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const installRecordPermissionPathIndexes = async ({
  database,
  context,
}: {
  database: RecordPermissionDatabase;
  context: RecordPermissionContext;
}): Promise<void> => {
  const installed = new Set<string>();
  for (const object of context.definition.objects) {
    for (const path of object.inheritancePaths) {
      const hops = resolveRecordPermissionPath({
        path,
        targetObjectUniversalIdentifier: object.objectUniversalIdentifier,
        metadata: context,
      });
      for (const hop of hops) {
        const owningObject =
          hop.sourceColumn === 'id' ? hop.targetObject : hop.sourceObject;
        const column =
          hop.sourceColumn === 'id' ? hop.targetColumn : hop.sourceColumn;
        const tableName = computeObjectTargetTable(owningObject);
        const indexName = `IDX_PERMISSION_PATH_${createHash('sha256').update(`${owningObject.id}:${column}`).digest('hex').slice(0, 24)}`;
        if (installed.has(indexName)) continue;
        installed.add(indexName);
        await createRecordPermissionIndex({
          database,
          schemaName: context.schemaName,
          indexName,
          definition: `ON ${escapeIdentifier(context.schemaName)}.${escapeIdentifier(tableName)} (${escapeIdentifier(column)}, id)`,
        });
      }
    }
  }
};
