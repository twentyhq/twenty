import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { type FlatFieldPermissionMaps } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission-maps.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// The grant's field permissions are a copy of the request's: admins can't edit them in v1
@Injectable()
export class ApplicationGrantFieldPermissionsService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fieldPermissionService: FieldPermissionService,
  ) {}

  async copyRequestedFieldPermissions({
    workspaceId,
    requestedRoleId,
    grantRoleId,
  }: {
    workspaceId: string;
    requestedRoleId: string;
    grantRoleId: string;
  }): Promise<void> {
    const { flatFieldPermissionMaps } =
      (await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldPermissionMaps',
      ] as unknown as Parameters<
        WorkspaceCacheService['getOrRecompute']
      >[1])) as unknown as { flatFieldPermissionMaps: FlatFieldPermissionMaps };

    const requestedFieldPermissions = Object.values(
      flatFieldPermissionMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatFieldPermission) => flatFieldPermission.roleId === requestedRoleId,
      );

    if (!isNonEmptyArray(requestedFieldPermissions)) {
      return;
    }

    await this.fieldPermissionService.upsertFieldPermissions({
      workspaceId,
      isSystemBuild: true,
      input: {
        roleId: grantRoleId,
        fieldPermissions: requestedFieldPermissions.map(
          (flatFieldPermission) => ({
            objectMetadataId: flatFieldPermission.objectMetadataId,
            fieldMetadataId: flatFieldPermission.fieldMetadataId,
            canReadFieldValue: flatFieldPermission.canReadFieldValue,
            canUpdateFieldValue: flatFieldPermission.canUpdateFieldValue,
          }),
        ),
      },
    });
  }
}
