import { Injectable } from '@nestjs/common';

import {
  type Manifest,
  type RoleManifestGrant,
} from 'twenty-shared/application';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getDefaultRoleGrantsAddedByManifest } from 'src/engine/core-modules/application/application-manifest/utils/get-default-role-grants-added-by-manifest.util';
import { getInstalledDefaultRoleManifest } from 'src/engine/core-modules/application/application-manifest/utils/get-installed-default-role-manifest.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationUpgradeRoleGrantService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async getDefaultRoleGrantsAddedByManifest({
    workspaceId,
    applicationId,
    manifest,
  }: {
    workspaceId: string;
    applicationId: string;
    manifest: Pick<Manifest, 'application' | 'roles' | 'permissionFlags'>;
  }): Promise<RoleManifestGrant[]> {
    const { flatApplicationMaps, ...allFlatEntityMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        ...Object.values(ALL_METADATA_NAME).map(getMetadataFlatEntityMapsKey),
        'flatApplicationMaps',
      ]);

    const installedDefaultRole = getInstalledDefaultRoleManifest({
      applicationId,
      flatApplicationMaps,
      allFlatEntityMaps,
    });

    if (!isDefined(installedDefaultRole)) {
      return [];
    }

    return getDefaultRoleGrantsAddedByManifest({
      installedDefaultRole,
      manifest,
    });
  }
}
