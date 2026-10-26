import {
  type RecordPermissionCondition,
  type RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordPermissionMetadata } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';

export const importRecordPermissionCondition = ({
  roleId,
  objectMetadataId,
  metadata,
  predicates,
  groups,
}: {
  roleId: string;
  objectMetadataId: string;
  metadata: RecordPermissionMetadata;
  predicates: FlatRowLevelPermissionPredicateMaps;
  groups: FlatRowLevelPermissionPredicateGroupMaps;
}): RecordPermissionCondition | null => {
  const relevantPredicates = Object.values(predicates.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (predicate) =>
        predicate.roleId === roleId &&
        predicate.objectMetadataId === objectMetadataId &&
        !isDefined(predicate.deletedAt),
    );
  const relevantGroups = Object.values(groups.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (group) =>
        group.roleId === roleId &&
        group.objectMetadataId === objectMetadataId &&
        !isDefined(group.deletedAt),
    );
  const buildGroup = (
    parentId: string | null,
    visited: string[],
  ): RecordPermissionCondition[] => {
    if (
      visited.length > 8 ||
      (isDefined(parentId) && visited.includes(parentId))
    )
      throw new Error(
        'Existing permission conditions contain a cycle or exceed the supported depth',
      );
    return [
      ...relevantPredicates
        .filter(
          (predicate) =>
            (predicate.rowLevelPermissionPredicateGroupId ?? null) === parentId,
        )
        .map((predicate): RecordPermissionCondition => ({
          kind: 'predicate',
          fieldUniversalIdentifier: findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: predicate.fieldMetadataId,
            flatEntityMaps: metadata.flatFieldMetadataMaps,
          }).universalIdentifier,
          operand: predicate.operand as RowLevelPermissionPredicateOperand,
          value: predicate.value,
          subFieldName: predicate.subFieldName,
          memberFieldUniversalIdentifier: isDefined(
            predicate.workspaceMemberFieldMetadataId,
          )
            ? findFlatEntityByIdInFlatEntityMapsOrThrow({
                flatEntityId: predicate.workspaceMemberFieldMetadataId,
                flatEntityMaps: metadata.flatFieldMetadataMaps,
              }).universalIdentifier
            : null,
          memberSubFieldName: predicate.workspaceMemberSubFieldName,
        })),
      ...relevantGroups
        .filter(
          (group) =>
            (group.parentRowLevelPermissionPredicateGroupId ?? null) ===
            parentId,
        )
        .flatMap((group): RecordPermissionCondition[] => {
          const conditions = buildGroup(
            group.id,
            isDefined(parentId) ? [...visited, parentId] : visited,
          );
          return conditions.length === 0
            ? []
            : [
                {
                  kind: group.logicalOperator === 'OR' ? 'any' : 'all',
                  conditions,
                },
              ];
        }),
    ];
  };
  if (relevantPredicates.length === 0) return null;
  const conditions = buildGroup(null, []);
  if (conditions.length === 0)
    throw new Error('Existing permission conditions reference missing groups');
  return conditions.length === 1 ? conditions[0] : { kind: 'all', conditions };
};
