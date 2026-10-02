import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';
import { isDefined } from 'twenty-shared/utils';

import { type RoleRelationLoaderPayload } from 'src/engine/dataloaders/types/role-relation-loader-payload.type';
import { type RowLevelPermissionsByRole } from 'src/engine/dataloaders/types/row-level-permissions-by-role.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { fromFlatRowLevelPermissionPredicateGroupToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-group-to-dto.util';
import { fromFlatRowLevelPermissionPredicateToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-to-dto.util';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';

const sortByPositionInRowLevelPermissionPredicateGroup = <
  TItem extends { positionInRowLevelPermissionPredicateGroup?: number | null },
>(
  items: TItem[],
): TItem[] =>
  [...items].sort(
    (itemA, itemB) =>
      (itemA.positionInRowLevelPermissionPredicateGroup ?? 0) -
      (itemB.positionInRowLevelPermissionPredicateGroup ?? 0),
  );

@Injectable()
export class RowLevelPermissionsByRoleIdLoaderFactory {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly rowLevelPermissionPredicateService: RowLevelPermissionPredicateService,
  ) {}

  create(): DataLoader<RoleRelationLoaderPayload, RowLevelPermissionsByRole> {
    return new DataLoader<RoleRelationLoaderPayload, RowLevelPermissionsByRole>(
      async (dataLoaderParams: readonly RoleRelationLoaderPayload[]) => {
        const workspaceId = dataLoaderParams[0].workspaceId;

        const hasRowLevelPermissionFeature =
          await this.rowLevelPermissionPredicateService.hasRowLevelPermissionFeature(
            workspaceId,
          );

        if (!hasRowLevelPermissionFeature) {
          return dataLoaderParams.map(() => ({
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          }));
        }

        const {
          flatRoleMaps,
          flatRowLevelPermissionPredicateMaps,
          flatRowLevelPermissionPredicateGroupMaps,
        } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatMapsKeys: [
                'flatRoleMaps',
                'flatRowLevelPermissionPredicateMaps',
                'flatRowLevelPermissionPredicateGroupMaps',
              ],
            },
          );

        return dataLoaderParams.map(({ roleId }) => {
          const flatRole = findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: roleId,
            flatEntityMaps: flatRoleMaps,
          });

          if (!isDefined(flatRole)) {
            return {
              rowLevelPermissionPredicates: [],
              rowLevelPermissionPredicateGroups: [],
            };
          }

          const flatPredicates = findManyFlatEntityByIdInFlatEntityMaps({
            flatEntityIds: flatRole.rowLevelPermissionPredicateIds,
            flatEntityMaps: flatRowLevelPermissionPredicateMaps,
          }).filter((flatPredicate) => !isDefined(flatPredicate.deletedAt));

          const flatPredicateGroups = findManyFlatEntityByIdInFlatEntityMaps({
            flatEntityIds: flatRole.rowLevelPermissionPredicateGroupIds,
            flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
          }).filter(
            (flatPredicateGroup) => !isDefined(flatPredicateGroup.deletedAt),
          );

          return {
            rowLevelPermissionPredicates:
              sortByPositionInRowLevelPermissionPredicateGroup(
                flatPredicates,
              ).map(fromFlatRowLevelPermissionPredicateToDto),
            rowLevelPermissionPredicateGroups:
              sortByPositionInRowLevelPermissionPredicateGroup(
                flatPredicateGroups,
              ).map(fromFlatRowLevelPermissionPredicateGroupToDto),
          };
        });
      },
    );
  }
}
