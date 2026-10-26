import {
  type RecordPermissionAction,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type RecordPermissionAccessGroup,
  type RecordPermissionContext,
  type ResolvedRecordPermissionPathHop,
} from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { resolveRecordPermissionPath } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-path.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { compileRecordPermissionGroup } from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const SHARE_LEVELS: Record<RecordPermissionAction, RecordShareAccessLevel[]> = {
  read: [
    RecordShareAccessLevel.READ,
    RecordShareAccessLevel.READ_WRITE,
    RecordShareAccessLevel.FULL,
  ],
  update: [RecordShareAccessLevel.READ_WRITE, RecordShareAccessLevel.FULL],
  softDelete: [RecordShareAccessLevel.FULL],
  destroy: [RecordShareAccessLevel.FULL],
  share: [RecordShareAccessLevel.FULL],
  receive: [],
};

// One indexed share lookup per bound Receive condition, independent of recipient count.
export const compileRecordShareProjection = ({
  context,
  groups,
  objectUniversalIdentifier,
  action,
  tableAlias,
}: {
  context: RecordPermissionContext;
  groups: RecordPermissionAccessGroup[];
  objectUniversalIdentifier: string;
  action: RecordPermissionAction;
  tableAlias: string;
}): SqlCondition => {
  if (SHARE_LEVELS[action].length === 0)
    return { sql: "'{}'::uuid[]", parameters: {} };
  const paths: { source: string; hops: ResolvedRecordPermissionPathHop[] }[] =
    [];
  const visit = (
    identifier: string,
    suffix: ResolvedRecordPermissionPathHop[],
    visited: string[],
  ) => {
    if (
      suffix.length > 3 ||
      visited.includes(identifier) ||
      context.capabilitiesByObjectUniversalIdentifier[identifier]?.[action] ===
        false
    )
      return;
    paths.push({ source: identifier, hops: suffix });
    for (const path of context.definition.objects.find(
      (object) => object.objectUniversalIdentifier === identifier,
    )?.inheritancePaths ?? []) {
      const hops = resolveRecordPermissionPath({
        path,
        targetObjectUniversalIdentifier: identifier,
        metadata: context,
      });
      visit(
        path.sourceObjectUniversalIdentifier,
        [...hops, ...suffix],
        [...visited, identifier],
      );
    }
  };
  visit(objectUniversalIdentifier, [], []);
  const parameters: Record<string, unknown> = {};
  const selects: string[] = [];
  const schema = escapeIdentifier(context.schemaName);

  for (const [pathIndex, path] of paths.entries()) {
    const object =
      context.flatObjectMetadataMaps.byUniversalIdentifier[path.source];
    if (!isDefined(object)) continue;
    const buckets = new Map<string, RecordPermissionAccessGroup[]>();
    for (const group of groups) {
      if (
        !isDefined(group.sharePrincipalIds) ||
        group.sourceObjectUniversalIdentifier !== path.source
      )
        continue;
      const key = JSON.stringify([
        group.rule?.universalIdentifier,
        group.filter,
        group.receiveSourceObjectUniversalIdentifier,
      ]);
      buckets.set(key, [...(buckets.get(key) ?? []), group]);
    }
    for (const [bucketIndex, bucket] of [...buckets.values()].entries()) {
      const prefix = `shareProjection_${SHARE_LEVELS[action].join('_')}_${pathIndex}_${bucketIndex}`;
      const sourceAlias =
        path.hops.length === 0 ? tableAlias : `${prefix}_source0`;
      const filter = compileRecordPermissionGroup({
        context,
        group: {
          ...bucket[0],
          sourceObjectUniversalIdentifier:
            bucket[0].receiveSourceObjectUniversalIdentifier ??
            bucket[0].sourceObjectUniversalIdentifier,
          sharePrincipalIds: null,
        },
        action: 'receive',
        objectUniversalIdentifier: path.source,
        tableAlias: sourceAlias,
      });
      if (filter.sql === 'FALSE') continue;
      const relationJoins = path.hops
        .slice(0, -1)
        .map(
          (hop, index) =>
            `JOIN ${schema}.${escapeIdentifier(computeObjectTargetTable(hop.targetObject))} ${escapeIdentifier(`${prefix}_source${index + 1}`)} ON ${escapeIdentifier(`${prefix}_source${index}`)}.${escapeIdentifier(hop.sourceColumn)} = ${escapeIdentifier(`${prefix}_source${index + 1}`)}.${escapeIdentifier(hop.targetColumn)}`,
        );
      const lastHop = path.hops[path.hops.length - 1];
      const relationFilter = isDefined(lastHop)
        ? `${escapeIdentifier(`${prefix}_source${path.hops.length - 1}`)}.${escapeIdentifier(lastHop.sourceColumn)} = ${escapeIdentifier(tableAlias)}.${escapeIdentifier(lastHop.targetColumn)} AND ${path.hops.map((_, index) => `${escapeIdentifier(`${prefix}_source${index}`)}."deletedAt" IS NULL`).join(' AND ')}`
        : 'TRUE';
      const sourceFrom =
        path.hops.length === 0
          ? ''
          : `${schema}.${escapeIdentifier(computeObjectTargetTable(object))} ${escapeIdentifier(sourceAlias)} ${relationJoins.join(' ')} CROSS JOIN `;
      selects.push(
        `SELECT (:${prefix}_bindings::jsonb ->> share."principalId"::text)::uuid AS value FROM ${sourceFrom}${schema}."recordShare" share WHERE :${prefix}_bindings::jsonb ? share."principalId"::text AND share."objectMetadataId" = :${prefix}_object::uuid AND share."recordId" = ${escapeIdentifier(sourceAlias)}.id AND share."deletedAt" IS NULL AND share."accessLevel"::text = ANY(:${prefix}_levels::text[]) AND (${relationFilter}) AND (${filter?.sql ?? 'TRUE'})`,
      );
      Object.assign(parameters, filter?.parameters, {
        [`${prefix}_bindings`]: JSON.stringify(
          Object.fromEntries(
            bucket.flatMap((group) =>
              (group.sharePrincipalIds ?? []).map((principalId) => [
                principalId,
                group.id,
              ]),
            ),
          ),
        ),
        [`${prefix}_object`]: object.id,
        [`${prefix}_levels`]: SHARE_LEVELS[action],
      });
    }
  }
  return {
    sql:
      selects.length === 0
        ? "'{}'::uuid[]"
        : `ARRAY(SELECT DISTINCT value FROM (${selects.join(' UNION ALL ')}) matchingShares ORDER BY value)`,
    parameters,
  };
};
