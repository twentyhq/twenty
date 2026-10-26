import { isDefined } from 'twenty-shared/utils';
import { MAX_RECORD_PERMISSION_INHERITANCE_DEPTH } from 'twenty-shared/constants';
import {
  type RecordPermissionAction,
  type RecordPermissionExplanationSource,
} from 'twenty-shared/types';

import { type RecordPermissionContext } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import {
  compileRecordPermission,
  compileRecordPermissionGroup,
} from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';
import { resolveRecordPermissionAccessGroups } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-access-groups.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const compileRecordPermissionExplanation = ({
  context,
  action,
  objectUniversalIdentifier,
  recordId,
}: {
  context: RecordPermissionContext;
  action: RecordPermissionAction;
  objectUniversalIdentifier: string;
  recordId: string;
}): {
  statement: SqlCondition;
  sources: RecordPermissionExplanationSource[];
} => {
  const object =
    context.flatObjectMetadataMaps.byUniversalIdentifier[
      objectUniversalIdentifier
    ];
  if (!isDefined(object))
    throw new Error('Permission target metadata is unavailable');
  const routes = (
    target: string,
    source: string,
    depth = 0,
    visited: string[] = [],
  ): string[][] => {
    if (
      depth > MAX_RECORD_PERMISSION_INHERITANCE_DEPTH ||
      visited.includes(target)
    )
      return [];
    if (target === source) return [[]];
    return (
      context.definition.objects
        .find((policy) => policy.objectUniversalIdentifier === target)
        ?.inheritancePaths.flatMap((path) =>
          routes(
            path.sourceObjectUniversalIdentifier,
            source,
            depth + path.fieldUniversalIdentifiers.length,
            [...visited, target],
          ).map((fields) => [...fields, ...path.fieldUniversalIdentifiers]),
        ) ?? []
    );
  };
  const full = compileRecordPermission({
    context,
    action,
    objectUniversalIdentifier,
    tableAlias: 'record',
    strategy: 'live',
  });
  const parameters: SqlCondition['parameters'] = {
    ...full.parameters,
    explanationRecordId: recordId,
  };
  const sources: RecordPermissionExplanationSource[] = [];
  const values: string[] = [];
  const seen = new Set<string>();
  for (const authority of context.authorities) {
    const groups = resolveRecordPermissionAccessGroups({
      revisionId: context.revisionId,
      definition: context.definition,
      authority,
      metadata: context,
    });
    for (const group of groups) {
      const rule = group.rule;
      if (!isDefined(rule)) continue;
      for (const fields of routes(
        objectUniversalIdentifier,
        group.sourceObjectUniversalIdentifier,
      )) {
        const id = JSON.stringify([group.id, fields]);
        if (seen.has(id)) continue;
        seen.add(id);
        const definition = {
          ...context.definition,
          objects: context.definition.objects.map((policy) =>
            policy.objectUniversalIdentifier === objectUniversalIdentifier &&
            fields.length > 0
              ? {
                  ...policy,
                  inheritancePaths:
                    fields.length === 0
                      ? []
                      : [
                          {
                            universalIdentifier: rule.universalIdentifier,
                            sourceObjectUniversalIdentifier:
                              group.sourceObjectUniversalIdentifier,
                            fieldUniversalIdentifiers: fields,
                          },
                        ],
                }
              : policy,
          ),
        };
        const condition = compileRecordPermissionGroup({
          context: { ...context, definition },
          group,
          action,
          objectUniversalIdentifier,
          tableAlias: 'record',
        });
        if (condition.sql === 'FALSE') continue;
        const parameterName = `explanationSource${sources.length}`;
        values.push(`(:${parameterName}::text, (${condition.sql}))`);
        Object.assign(parameters, condition.parameters, {
          [parameterName]: id,
        });
        sources.push({
          id,
          accessGroupId: group.id,
          ruleUniversalIdentifier: rule.universalIdentifier,
          conditional: rule.condition !== null,
          kind: group.sharePrincipalIds === null ? 'rule' : 'share',
          sourceObjectUniversalIdentifier:
            group.sourceObjectUniversalIdentifier,
          fieldUniversalIdentifiers: fields,
        });
      }
    }
  }
  return {
    sources,
    statement: {
      sql: `SELECT (${full.sql}) AS allowed, ${values.length === 0 ? 'ARRAY[]::text[]' : `ARRAY(SELECT source.id FROM (VALUES ${values.join(', ')}) AS source(id, allowed) WHERE source.allowed ORDER BY source.id LIMIT 101)`} AS "sourceIds" FROM ${escapeIdentifier(context.schemaName)}.${escapeIdentifier(computeObjectTargetTable(object))} AS record WHERE record.id = :explanationRecordId::uuid AND record."deletedAt" IS NULL`,
      parameters,
    },
  };
};
