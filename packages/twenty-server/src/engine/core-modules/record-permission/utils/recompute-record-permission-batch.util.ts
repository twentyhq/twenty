import { compileRecordShareProjection } from 'src/engine/core-modules/record-permission/utils/compile-record-share-projection.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';
import {
  RECORD_PERMISSION_ACTIONS,
  RECORD_PERMISSION_ACCESS_COLUMNS,
} from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import {
  type RecordPermissionAccessGroup,
  type RecordPermissionContext,
} from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { type RecordPermissionDatabase } from 'src/engine/core-modules/record-permission/types/record-permission-database.type';
import { compileRecordPermissionGroup } from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const recomputeRecordPermissionBatch = async ({
  database,
  context,
  groups,
  objectUniversalIdentifier,
  recordIds,
  projectionQueries,
}: {
  database: RecordPermissionDatabase;
  context: RecordPermissionContext;
  groups: RecordPermissionAccessGroup[];
  objectUniversalIdentifier: string;
  recordIds: string[];
  projectionQueries?: Map<string, SqlCondition>;
}): Promise<number> => {
  if (recordIds.length === 0) {
    return 0;
  }
  const object =
    context.flatObjectMetadataMaps.byUniversalIdentifier[
      objectUniversalIdentifier
    ];

  if (!isDefined(object)) {
    throw new Error('Permission projection object no longer exists');
  }

  const cachedQuery = projectionQueries?.get(objectUniversalIdentifier);

  if (isDefined(cachedQuery)) {
    const query = compileNamedParameters(cachedQuery.sql, {
      ...cachedQuery.parameters,
      permissionRecordIds: recordIds,
    });
    return (await database.query(query.text, query.values)).length;
  }
  const sourceObjects = new Set<string>();
  const visit = (identifier: string, depth: number) => {
    if (depth > 3) return;
    sourceObjects.add(identifier);
    for (const path of context.definition.objects.find(
      (object) => object.objectUniversalIdentifier === identifier,
    )?.inheritancePaths ?? []) {
      visit(
        path.sourceObjectUniversalIdentifier,
        depth + path.fieldUniversalIdentifiers.length,
      );
    }
  };
  visit(objectUniversalIdentifier, 0);
  const applicableGroups = groups.filter((group) =>
    sourceObjects.has(group.sourceObjectUniversalIdentifier),
  );
  const parameters: Record<string, unknown> = {
    permissionRevisionId: context.revisionId,
  };
  const evaluatedExpressions = new Map<
    string,
    { alias: string; sql: string }
  >();
  const evaluateOnce = (condition: SqlCondition): string => {
    if (
      condition.sql === 'TRUE' ||
      condition.sql === 'FALSE' ||
      condition.sql === "'{}'::uuid[]"
    )
      return condition.sql;
    const key = JSON.stringify([condition.sql, condition.parameters]);
    const existing = evaluatedExpressions.get(key);
    if (isDefined(existing)) return escapeIdentifier(existing.alias);
    const alias = `permissionExpression${evaluatedExpressions.size}`;
    evaluatedExpressions.set(key, { alias, sql: condition.sql });
    return escapeIdentifier(alias);
  };
  const targetPolicy = context.definition.objects.find(
    (policy) => policy.objectUniversalIdentifier === objectUniversalIdentifier,
  );
  const expressions = RECORD_PERMISSION_ACTIONS.map((action) => {
    const wholeObjectRoles = new Set(
      targetPolicy?.rules
        .filter(
          (rule) => rule.condition === null && rule.actions.includes(action),
        )
        .map((rule) => rule.roleUniversalIdentifier),
    );
    const actionGroups = applicableGroups.filter(
      (group) => !wholeObjectRoles.has(group.roleUniversalIdentifier),
    );
    const shareGroups = compileRecordShareProjection({
      context,
      groups: actionGroups,
      objectUniversalIdentifier,
      action,
      tableAlias: 'permissionTarget',
    });
    Object.assign(parameters, shareGroups.parameters);
    const matches = actionGroups
      // Whole-object grants are evaluated without arrays; only inherited matches need projection.
      .filter(
        (group) =>
          group.sharePrincipalIds === null &&
          !(
            group.sourceObjectUniversalIdentifier ===
              objectUniversalIdentifier && group.filter === null
          ),
      )
      .flatMap((group) => {
        const condition = compileRecordPermissionGroup({
          context,
          group,
          action,
          objectUniversalIdentifier,
          tableAlias: 'permissionTarget',
        });

        if (condition.sql === 'FALSE') {
          return [];
        }

        const parameterName = `projectionGroup_${group.id.replace(/-/g, '')}`;

        Object.assign(parameters, condition.parameters, {
          [parameterName]: group.id,
        });

        return [
          `CASE WHEN (${evaluateOnce(condition)}) THEN :${parameterName}::uuid END`,
        ];
      });

    const ruleGroups =
      matches.length === 0
        ? "'{}'::uuid[]"
        : `ARRAY(SELECT DISTINCT value FROM unnest(ARRAY[${matches.join(', ')}]) AS value WHERE value IS NOT NULL ORDER BY value)`;
    return {
      column: RECORD_PERMISSION_ACCESS_COLUMNS[action],
      sql: `${ruleGroups} || ${evaluateOnce(shareGroups)}`,
    };
  });
  const table = `${escapeIdentifier(context.schemaName)}.${escapeIdentifier(computeObjectTargetTable(object))}`;
  const assignments = expressions
    .map(
      ({ column }) =>
        `${escapeIdentifier(column)} = computed.${escapeIdentifier(column)}`,
    )
    .join(', ');
  const retained = (column: string) =>
    `ARRAY(SELECT value FROM unnest("permissionTarget".${escapeIdentifier(column)}) value WHERE EXISTS (SELECT 1 FROM ${escapeIdentifier(context.schemaName)}."recordPermissionAccessGroup" revisionGroup CROSS JOIN ${escapeIdentifier(context.schemaName)}."recordPermissionState" state WHERE revisionGroup.id = value AND revisionGroup."revisionId" <> :permissionRevisionId AND revisionGroup."revisionId" IN (state."activeRevisionId", state."candidateRevisionId")))`;
  const selectColumns = expressions
    .map(
      ({ column, sql }) =>
        `ARRAY(SELECT DISTINCT combined FROM unnest(${retained(column)} || ${sql}) combined ORDER BY combined) AS ${escapeIdentifier(column)}`,
    )
    .join(', ');
  const differences = expressions
    .map(
      ({ column }) =>
        `target.${escapeIdentifier(column)} IS DISTINCT FROM computed.${escapeIdentifier(column)}`,
    )
    .join(' OR ');
  // Most rules grant several actions. Materialize their identical predicates once per row.
  const evaluatedColumns = [...evaluatedExpressions.values()]
    .map(({ alias, sql }) => `, (${sql}) AS ${escapeIdentifier(alias)}`)
    .join('');
  const retainedColumns = RECORD_PERMISSION_ACTIONS.map(
    (action) =>
      `, "permissionTarget".${escapeIdentifier(RECORD_PERMISSION_ACCESS_COLUMNS[action])}`,
  ).join('');
  const sql = `WITH evaluated AS MATERIALIZED (SELECT "permissionTarget".id${retainedColumns}${evaluatedColumns} FROM ${table} AS "permissionTarget" WHERE "permissionTarget".id = ANY(:permissionRecordIds::uuid[])), computed AS MATERIALIZED (SELECT "permissionTarget".id, ${selectColumns} FROM evaluated AS "permissionTarget"), updated AS (UPDATE ${table} AS target SET ${assignments} FROM computed WHERE target.id = computed.id AND (${differences}) RETURNING target.id) SELECT id FROM updated`;
  projectionQueries?.set(objectUniversalIdentifier, { sql, parameters });
  const statement = compileNamedParameters(sql, {
    ...parameters,
    permissionRecordIds: recordIds,
  });
  const updated = await database.query(statement.text, statement.values);

  return updated.length;
};
