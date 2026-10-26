import { isDefined } from 'twenty-shared/utils';
import { getRecordPermissionRoleDefinition } from 'src/engine/core-modules/record-permission/utils/get-record-permission-role-definition.util';

import {
  type RecordPermissionAuthority,
  type RecordPermissionContext,
  type RecordPermissionAccessGroup,
} from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { type RecordPermissionDatabase } from 'src/engine/core-modules/record-permission/types/record-permission-database.type';
import { compileRecordPermissionGroup } from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';
import { resolveRecordPermissionAccessGroups } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-access-groups.util';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type RecordPermissionRoleAccess = {
  canRead: boolean;
  canUpdate: boolean;
  hasSomeReadAccess: boolean;
  hasSomeUpdateAccess: boolean;
};

export const evaluateRecordPermissionRoleAccess = async ({
  database,
  context,
  objectUniversalIdentifier,
  recordId,
  authorities,
}: {
  database: RecordPermissionDatabase;
  context: RecordPermissionContext;
  objectUniversalIdentifier: string;
  recordId: string;
  authorities: RecordPermissionAuthority[];
}): Promise<Map<string, RecordPermissionRoleAccess>> => {
  const object =
    context.flatObjectMetadataMaps.byUniversalIdentifier[
      objectUniversalIdentifier
    ];
  if (!isDefined(object)) throw new Error('Permission object is unavailable');
  const roleContext = {
    ...context,
    definition: getRecordPermissionRoleDefinition(
      context.definition,
      objectUniversalIdentifier,
    ),
  };
  const groups = new Map<string, RecordPermissionAccessGroup>();
  const members = authorities.map((authority) => {
    const memberGroups = resolveRecordPermissionAccessGroups({
      revisionId: context.revisionId,
      definition: roleContext.definition,
      metadata: context,
      authority,
    }).filter((group) => group.sharePrincipalIds === null);
    for (const group of memberGroups) groups.set(group.id, group);
    return {
      roleId: authority.roleId,
      groups: memberGroups.map((group) => group.id),
    };
  });
  const conditions = new Map<string, SqlCondition>();
  for (const group of groups.values()) {
    for (const action of ['read', 'update'] as const) {
      const condition = compileRecordPermissionGroup({
        context: roleContext,
        group,
        action,
        objectUniversalIdentifier,
        tableAlias: 'record',
      });
      if (condition.sql !== 'FALSE')
        conditions.set(`${group.id}:${action}`, condition);
    }
  }
  const allowed = new Set<string>();
  const entries = [...conditions];

  // Evaluate distinct bindings in bounded point queries, never one query per member.
  for (let offset = 0; offset < entries.length; offset += 250) {
    const parameters: SqlCondition['parameters'] = {
      roleAccessRecordId: recordId,
    };
    const values = entries
      .slice(offset, offset + 250)
      .map(([key, condition], index) => {
        Object.assign(parameters, condition.parameters, {
          [`roleAccessKey${index}`]: key,
        });
        return `(:roleAccessKey${index}::text, (${condition.sql}))`;
      });
    const statement = compileNamedParameters(
      `SELECT evaluation.key FROM ${escapeIdentifier(context.schemaName)}.${escapeIdentifier(computeObjectTargetTable(object))} record CROSS JOIN LATERAL (VALUES ${values.join(', ')}) evaluation(key, allowed) WHERE record.id = :roleAccessRecordId AND record."deletedAt" IS NULL AND evaluation.allowed`,
      parameters,
    );
    const rows = await database.query(statement.text, statement.values);
    for (const row of rows)
      if (typeof row.key === 'string') allowed.add(row.key);
  }

  const result = new Map<string, RecordPermissionRoleAccess>();
  for (const member of members) {
    const canRead = member.groups.some((id) => allowed.has(`${id}:read`));
    const canUpdate =
      canRead && member.groups.some((id) => allowed.has(`${id}:update`));
    const previous = result.get(member.roleId);
    result.set(member.roleId, {
      canRead: (previous?.canRead ?? true) && canRead,
      canUpdate: (previous?.canUpdate ?? true) && canUpdate,
      hasSomeReadAccess: (previous?.hasSomeReadAccess ?? false) || canRead,
      hasSomeUpdateAccess:
        (previous?.hasSomeUpdateAccess ?? false) || canUpdate,
    });
  }
  return result;
};
