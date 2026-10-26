import { parseRecordPermissionPolicy } from 'twenty-shared/utils';
import { type RecordPermissionCondition } from 'twenty-shared/types';

import { type RecordPermissionDatabase } from 'src/engine/core-modules/record-permission/types/record-permission-database.type';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';

export const assertRecordPermissionMetadataDependencies = async ({
  database,
  workspaceId,
  actions,
}: {
  database: RecordPermissionDatabase;
  workspaceId: string;
  actions: AllUniversalWorkspaceMigrationAction[];
}): Promise<void> => {
  const changes = actions.filter(
    (action) =>
      (action.type === 'delete' &&
        ['objectMetadata', 'fieldMetadata'].includes(action.metadataName)) ||
      (action.type === 'update' &&
        action.metadataName === 'fieldMetadata' &&
        [
          'type',
          'settings',
          'relationTargetFieldMetadataUniversalIdentifier',
          'relationTargetObjectMetadataUniversalIdentifier',
        ].some((property) => property in action.update)),
  );

  if (changes.length === 0) return;
  const revisions = await database.query(
    `SELECT definition FROM core."recordPermissionRevision" WHERE "workspaceId" = $1 AND status IN ('active', 'building')`,
    [workspaceId],
  );
  const references = new Set<string>();
  const visitCondition = (
    condition: RecordPermissionCondition | null,
  ): void => {
    if (condition === null) return;
    if (condition.kind === 'predicate') {
      references.add(condition.fieldUniversalIdentifier);
      if (condition.memberFieldUniversalIdentifier)
        references.add(condition.memberFieldUniversalIdentifier);
    } else {
      condition.conditions.forEach(visitCondition);
    }
  };
  for (const revision of revisions) {
    const definition = parseRecordPermissionPolicy(revision.definition);
    for (const object of definition.objects) {
      if (object.rules.length > 0 || object.inheritancePaths.length > 0)
        references.add(object.objectUniversalIdentifier);
      object.rules.forEach((rule) => visitCondition(rule.condition));
      for (const path of object.inheritancePaths) {
        references.add(path.sourceObjectUniversalIdentifier);
        path.fieldUniversalIdentifiers.forEach((identifier) =>
          references.add(identifier),
        );
      }
    }
  }
  const fields = await database.query(
    `SELECT field."universalIdentifier", owner."universalIdentifier" AS "objectUniversalIdentifier", inverse."universalIdentifier" AS "inverseUniversalIdentifier", target."universalIdentifier" AS "targetUniversalIdentifier"
    FROM core."fieldMetadata" field
    JOIN core."objectMetadata" owner ON owner.id = field."objectMetadataId"
    LEFT JOIN core."fieldMetadata" inverse ON inverse.id = field."relationTargetFieldMetadataId"
    LEFT JOIN core."objectMetadata" target ON target.id = field."relationTargetObjectMetadataId"
    WHERE field."workspaceId" = $1`,
    [workspaceId],
  );
  for (const field of fields) {
    if (references.has(String(field.universalIdentifier))) {
      for (const identifier of [
        field.objectUniversalIdentifier,
        field.inverseUniversalIdentifier,
        field.targetUniversalIdentifier,
      ]) {
        if (typeof identifier === 'string') references.add(identifier);
      }
    }
  }
  for (const deletion of changes) {
    if (
      deletion.type !== 'create' &&
      references.has(deletion.universalIdentifier)
    ) {
      throw new Error(
        'Remove this field or object from active record permission rules before deleting it or changing its structure',
      );
    }
  }
};
