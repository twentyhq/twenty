import { type RecordPermissionContext } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { resolveRecordPermissionPath } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-path.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const compileInheritedRecordShares = ({
  context,
  targetObjectUniversalIdentifier,
  recordId,
  after,
}: {
  context: RecordPermissionContext;
  targetObjectUniversalIdentifier: string;
  recordId: string;
  after?: string;
}): SqlCondition | undefined => {
  const paths: { source: string; fields: string[] }[] = [];
  const visit = (target: string, suffix: string[], visited: string[]): void => {
    if (visited.includes(target)) return;
    const object = context.definition.objects.find(
      (candidate) => candidate.objectUniversalIdentifier === target,
    );

    for (const path of object?.inheritancePaths ?? []) {
      const fields = [...path.fieldUniversalIdentifiers, ...suffix];

      if (fields.length > 3) continue;
      paths.push({ source: path.sourceObjectUniversalIdentifier, fields });
      visit(path.sourceObjectUniversalIdentifier, fields, [...visited, target]);
    }
  };

  visit(targetObjectUniversalIdentifier, [], []);
  if (paths.length === 0) return undefined;
  const schema = escapeIdentifier(context.schemaName);
  const parameters: Record<string, unknown> = {
    inheritedShareTargetId: recordId,
    inheritedShareAfter: after ?? null,
  };
  const selects = paths.map((path, pathIndex) => {
    const hops = resolveRecordPermissionPath({
      metadata: context,
      targetObjectUniversalIdentifier,
      path: {
        universalIdentifier: path.fields[0],
        sourceObjectUniversalIdentifier: path.source,
        fieldUniversalIdentifiers: path.fields,
      },
    });
    const aliases = [...hops.map((_, index) => `source${index}`), 'target'];
    const joins = hops.map(
      (hop, index) =>
        `JOIN ${schema}.${escapeIdentifier(computeObjectTargetTable(hop.targetObject))} ${escapeIdentifier(aliases[index + 1])} ON ${escapeIdentifier(aliases[index])}.${escapeIdentifier(hop.sourceColumn)} = ${escapeIdentifier(aliases[index + 1])}.${escapeIdentifier(hop.targetColumn)}`,
    );
    const objectParameter = `inheritedShareObject${pathIndex}`;
    const pathParameter = `inheritedSharePath${pathIndex}`;

    parameters[objectParameter] = hops[0].sourceObject.id;
    parameters[pathParameter] = path.fields;

    return `SELECT share.*, :${pathParameter}::uuid[] AS "fieldUniversalIdentifiers"
      FROM ${schema}.${escapeIdentifier(computeObjectTargetTable(hops[0].sourceObject))} source0
      ${joins.join(' ')}
      JOIN ${schema}."recordShare" share ON share."objectMetadataId" = :${objectParameter}::uuid AND share."recordId" = source0.id
      WHERE target.id = :inheritedShareTargetId::uuid AND ${aliases.map((alias) => `${escapeIdentifier(alias)}."deletedAt" IS NULL`).join(' AND ')}
      AND (:inheritedShareAfter::uuid IS NULL OR share.id > :inheritedShareAfter::uuid) AND share."deletedAt" IS NULL AND share."accessLevel"::text <> 'NONE'`;
  });

  return {
    sql: `SELECT DISTINCT ON (id) * FROM (${selects.join(' UNION ALL ')}) inherited ORDER BY id, "fieldUniversalIdentifiers" LIMIT 101`,
    parameters,
  };
};
