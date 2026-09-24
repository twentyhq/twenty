import { Injectable } from '@nestjs/common';

import {
  type Manifest,
  type RoleManifest,
  type RoleManifestGrant,
} from 'twenty-shared/application';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getApplicationSubAllFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/get-application-sub-all-flat-entity-maps.util';
import { getDefaultRoleGrantsAddedByManifest } from 'src/engine/core-modules/application/application-manifest/utils/get-default-role-grants-added-by-manifest.util';
import { reconstructRolesManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-roles-manifest.util';
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
    const installedDefaultRole = await this.getInstalledDefaultRoleManifest({
      workspaceId,
      applicationId,
    });

    if (!isDefined(installedDefaultRole)) {
      return [];
    }

    return getDefaultRoleGrantsAddedByManifest({
      installedDefaultRole,
      manifest,
    });
  }

  private async getInstalledDefaultRoleManifest({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<RoleManifest | undefined> {
    const { flatApplicationMaps, ...allFlatEntityMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        ...Object.values(ALL_METADATA_NAME).map(getMetadataFlatEntityMapsKey),
        'flatApplicationMaps',
      ]);

    const defaultRoleId =
      flatApplicationMaps.byId[applicationId]?.defaultRoleId;

    if (!isDefined(defaultRoleId)) {
      return undefined;
    }

    const defaultRoleUniversalIdentifier =
      allFlatEntityMaps.flatRoleMaps.universalIdentifierById[defaultRoleId];

    if (!isDefined(defaultRoleUniversalIdentifier)) {
      return undefined;
    }

    const applicationAllFlatEntityMaps = getApplicationSubAllFlatEntityMaps({
      applicationIds: [applicationId],
      fromAllFlatEntityMaps: allFlatEntityMaps,
    });

    // Every application object and field counts as resolvable here: the
    // comparison must see the whole installed role, not only what an export
    // would keep.
    const { roles } = reconstructRolesManifest({
      applicationAllFlatEntityMaps,
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: new Set(
        Object.keys(
          applicationAllFlatEntityMaps.flatObjectMetadataMaps
            .byUniversalIdentifier,
        ),
      ),
      resolvableFieldUniversalIdentifiers: new Set(
        Object.keys(
          applicationAllFlatEntityMaps.flatFieldMetadataMaps
            .byUniversalIdentifier,
        ),
      ),
    });

    return roles.find(
      ({ universalIdentifier }) =>
        universalIdentifier === defaultRoleUniversalIdentifier,
    );
  }
}
