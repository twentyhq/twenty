import { createHash } from 'node:crypto';
import {
  MAX_RECORD_PERMISSION_INHERITANCE_DEPTH,
  RECORD_PERMISSION_ACCESS_COLUMNS,
} from 'twenty-shared/constants';
import {
  type RecordPermissionAction,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type RecordPermissionAccessGroup,
  type RecordPermissionContext,
} from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { resolveRecordPermissionAccessGroups } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-access-groups.util';
import { resolveRecordPermissionPath } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-path.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/twenty-orm/utils/combine-sql-conditions.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const DENIED: SqlCondition = { sql: 'FALSE', parameters: {} };
const OPEN: SqlCondition = { sql: 'TRUE', parameters: {} };
const DELEGATION_RANK = { NONE: 0, READ: 1, READ_WRITE: 2, FULL: 3 };
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

export const compileRecordPermissionGroup = ({
  context,
  group,
  action,
  objectUniversalIdentifier,
  tableAlias,
  delegatedAccessLevel,
  depth = 0,
  visited = [],
}: {
  context: RecordPermissionContext;
  group: RecordPermissionAccessGroup;
  action: RecordPermissionAction;
  objectUniversalIdentifier: string;
  tableAlias: string;
  delegatedAccessLevel?: RecordShareAccessLevel;
  depth?: number;
  visited?: string[];
}): SqlCondition => {
  if (
    (group.sharePrincipalIds === null &&
      !group.rule?.actions.includes(action)) ||
    depth > MAX_RECORD_PERMISSION_INHERITANCE_DEPTH ||
    visited.includes(objectUniversalIdentifier) ||
    context.capabilitiesByObjectUniversalIdentifier[
      objectUniversalIdentifier
    ]?.[action] === false
  ) {
    return DENIED;
  }

  const objectPolicy = context.definition.objects.find(
    (object) => object.objectUniversalIdentifier === objectUniversalIdentifier,
  );
  const objectMetadata =
    context.flatObjectMetadataMaps.byUniversalIdentifier[
      objectUniversalIdentifier
    ];

  if (!isDefined(objectPolicy) || !isDefined(objectMetadata)) {
    return DENIED;
  }

  const grants: SqlCondition[] = [];

  if (
    group.sourceObjectUniversalIdentifier === objectUniversalIdentifier &&
    isDefined(group.rule)
  ) {
    const filter = isDefined(group.sharePrincipalIds)
      ? compileRecordPermissionGroup({
          context,
          group: {
            ...group,
            sourceObjectUniversalIdentifier:
              group.receiveSourceObjectUniversalIdentifier ??
              group.sourceObjectUniversalIdentifier,
            sharePrincipalIds: null,
          },
          action: 'receive',
          objectUniversalIdentifier,
          tableAlias,
        })
      : isDefined(group.filter)
        ? (renderRowLevelPermissionFilterToSql({
            recordFilter: group.filter,
            tableAlias,
            objectMetadata,
            flatFieldMetadataMaps: context.flatFieldMetadataMaps,
          }) ?? OPEN)
        : OPEN;

    if (
      filter.sql !== 'FALSE' &&
      !isDefined(group.sharePrincipalIds) &&
      group.rule.actions.includes(action) &&
      (!isDefined(delegatedAccessLevel) ||
        DELEGATION_RANK[
          group.rule.shareAccessLevel ?? RecordShareAccessLevel.FULL
        ] >= DELEGATION_RANK[delegatedAccessLevel])
    ) {
      grants.push(filter);
    } else if (
      filter.sql !== 'FALSE' &&
      isDefined(group.sharePrincipalIds) &&
      SHARE_LEVELS[action].length > 0
    ) {
      const parameterPrefix = `share_${tableAlias}_${group.id.replace(/-/g, '')}`;

      grants.push(
        combineSqlConditions(
          [
            filter,
            {
              sql: `EXISTS (SELECT 1 FROM ${escapeIdentifier(context.schemaName)}."recordShare" AS "permissionShare" WHERE "permissionShare"."objectMetadataId" = :${parameterPrefix}_object AND "permissionShare"."recordId" = ${escapeIdentifier(tableAlias)}."id" AND "permissionShare"."principalId" = ANY(:${parameterPrefix}_principals::uuid[]) AND "permissionShare"."accessLevel"::text = ANY(:${parameterPrefix}_levels::text[]) AND "permissionShare"."deletedAt" IS NULL)`,
              parameters: {
                [`${parameterPrefix}_object`]: objectMetadata.id,
                [`${parameterPrefix}_principals`]: group.sharePrincipalIds,
                [`${parameterPrefix}_levels`]: SHARE_LEVELS[action],
              },
            },
          ],
          'AND',
        ),
      );
    }
  }

  for (const [pathIndex, path] of objectPolicy.inheritancePaths.entries()) {
    const hops = resolveRecordPermissionPath({
      path,
      targetObjectUniversalIdentifier: objectUniversalIdentifier,
      metadata: context,
    });

    if (depth + hops.length > MAX_RECORD_PERMISSION_INHERITANCE_DEPTH) {
      continue;
    }

    const aliasScope = createHash('sha256')
      .update(`${tableAlias}:${group.id}`)
      .digest('hex')
      .slice(0, 8);
    const aliases = hops.map(
      (_, index) => `permission_${depth}_${pathIndex}_${index}_${aliasScope}`,
    );
    const sourcePolicy = compileRecordPermissionGroup({
      context,
      group,
      action,
      objectUniversalIdentifier: path.sourceObjectUniversalIdentifier,
      tableAlias: aliases[0],
      delegatedAccessLevel,
      depth: depth + hops.length,
      visited: [...visited, objectUniversalIdentifier],
    });
    if (sourcePolicy.sql === 'FALSE') {
      continue;
    }

    const joins: string[] = [];

    for (let index = 1; index < hops.length; index++) {
      const object = hops[index].sourceObject;
      joins.push(
        `JOIN ${escapeIdentifier(context.schemaName)}.${escapeIdentifier(computeObjectTargetTable(object))} AS ${escapeIdentifier(aliases[index])} ON ${escapeIdentifier(aliases[index - 1])}.${escapeIdentifier(hops[index - 1].sourceColumn)} = ${escapeIdentifier(aliases[index])}.${escapeIdentifier(hops[index - 1].targetColumn)}`,
      );
    }

    const firstObject = hops[0].sourceObject;
    const lastHop = hops[hops.length - 1];
    const activeRelations = aliases
      .map((alias) => `${escapeIdentifier(alias)}."deletedAt" IS NULL`)
      .join(' AND ');

    grants.push({
      sql: `EXISTS (SELECT 1 FROM ${escapeIdentifier(context.schemaName)}.${escapeIdentifier(computeObjectTargetTable(firstObject))} AS ${escapeIdentifier(aliases[0])} ${joins.join(' ')} WHERE ${escapeIdentifier(aliases[aliases.length - 1])}.${escapeIdentifier(lastHop.sourceColumn)} = ${escapeIdentifier(tableAlias)}.${escapeIdentifier(lastHop.targetColumn)} AND ${activeRelations} AND (${sourcePolicy.sql}))`,
      parameters: sourcePolicy.parameters,
    });
  }

  return grants.length === 0 ? DENIED : combineSqlConditions(grants, 'OR');
};

export const compileRecordPermission = ({
  context,
  action,
  objectUniversalIdentifier,
  tableAlias,
  strategy,
  delegatedAccessLevel,
}: {
  context: RecordPermissionContext;
  action: RecordPermissionAction;
  objectUniversalIdentifier: string;
  tableAlias: string;
  strategy: 'live' | 'projected';
  delegatedAccessLevel?: RecordShareAccessLevel;
}): SqlCondition => {
  if (
    context.denyAll === true ||
    context.authorities.length === 0 ||
    context.capabilitiesByObjectUniversalIdentifier[
      objectUniversalIdentifier
    ]?.[action] === false
  ) {
    return DENIED;
  }

  const conditions = context.authorities.map((authority, index) => {
    const groups = resolveRecordPermissionAccessGroups({
      revisionId: context.revisionId,
      definition: context.definition,
      authority,
      metadata: context,
    });

    if (
      groups.some(
        (group) =>
          group.sourceObjectUniversalIdentifier === objectUniversalIdentifier &&
          group.filter === null &&
          group.sharePrincipalIds === null &&
          group.rule?.actions.includes(action) &&
          (!isDefined(delegatedAccessLevel) ||
            DELEGATION_RANK[
              group.rule.shareAccessLevel ?? RecordShareAccessLevel.FULL
            ] >= DELEGATION_RANK[delegatedAccessLevel]),
      )
    ) {
      return OPEN;
    }

    if (strategy === 'live') {
      const grants = groups.map((group) =>
        compileRecordPermissionGroup({
          context,
          group,
          action,
          objectUniversalIdentifier,
          tableAlias,
          delegatedAccessLevel,
        }),
      );

      return grants.length === 0 ? DENIED : combineSqlConditions(grants, 'OR');
    }

    const parameterName = `permissionGroups_${tableAlias}_${action}_${index}`;

    return {
      sql: `${escapeIdentifier(tableAlias)}.${escapeIdentifier(RECORD_PERMISSION_ACCESS_COLUMNS[action])} && :${parameterName}::uuid[]`,
      parameters: {
        [parameterName]: groups
          .filter(
            (group) =>
              compileRecordPermissionGroup({
                context,
                group,
                action,
                objectUniversalIdentifier,
                tableAlias,
                delegatedAccessLevel,
              }).sql !== 'FALSE',
          )
          .map((group) => group.id),
      },
    };
  });

  return combineSqlConditions(
    [
      ...conditions,
      {
        sql: `EXISTS (SELECT 1 FROM core."recordPermissionRevision" WHERE id = :permissionActiveRevisionId AND status = 'active')`,
        parameters: { permissionActiveRevisionId: context.revisionId },
      },
    ],
    'AND',
  );
};
