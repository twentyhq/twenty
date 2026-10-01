/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type ObjectAccessOverviewDTO } from 'src/engine/core-modules/record-share/dtos/object-access-overview.dto';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ObjectAccessOverviewService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
  ) {}

  async getObjectAccessOverview({
    workspaceId,
    objectMetadataId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<ObjectAccessOverviewDTO> {
    const {
      flatObjectMetadataMaps,
      flatRoleMaps,
      rolesPermissions,
      roleIdsWithAllRecordsAccess,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatRoleMaps',
      'rolesPermissions',
      'roleIdsWithAllRecordsAccess',
    ]);

    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata)) {
      throw new NotFoundError('Object not found');
    }

    const roles = Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map((role) => {
        const objectPermissions = rolesPermissions[role.id]?.[objectMetadataId];

        return {
          id: role.id,
          label: role.label,
          icon: role.icon ?? null,
          canRead: objectPermissions?.canReadObjectRecords ?? false,
          canUpdate: objectPermissions?.canUpdateObjectRecords ?? false,
          canSoftDelete: objectPermissions?.canSoftDeleteObjectRecords ?? false,
          canDestroy: objectPermissions?.canDestroyObjectRecords ?? false,
          hasRowFilter:
            (objectPermissions?.rowLevelPermissionPredicates.length ?? 0) > 0,
          canAccessAllRecords: roleIdsWithAllRecordsAccess.includes(role.id),
        };
      })
      .sort((roleA, roleB) => roleA.label.localeCompare(roleB.label));

    const { restrictedRecordCount, sharedRecordCount } =
      await this.recordShareStorageService.countRestrictedAndSharedRecords({
        workspaceId,
        objectMetadataId,
      });

    return {
      objectMetadataId,
      roles,
      restrictedRecordCount,
      sharedRecordCount,
    };
  }
}
