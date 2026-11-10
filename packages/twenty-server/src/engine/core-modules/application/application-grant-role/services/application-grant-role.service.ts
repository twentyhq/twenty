import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  APPLICATION_GRANT_ROLE_DEPENDENCY_FLAT_ENTITY_MAPS_KEYS,
  buildApplicationGrantRoleFromToFlatEntityMaps,
} from 'src/engine/core-modules/application/application-grant-role/utils/build-application-grant-role-from-to-flat-entity-maps.util';
import { findApplicationGrantRoleFlatRoleTarget } from 'src/engine/core-modules/application/application-grant-role/utils/find-application-grant-role-flat-role-target.util';
import { canApplicationHaveGrantRole } from 'src/engine/core-modules/application/application-grant-role/utils/can-application-have-grant-role.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// A grant role copies an application's requested role, see twentyhq/core-team-issues#3139
@Injectable()
export class ApplicationGrantRoleService {
  private readonly logger = new Logger(ApplicationGrantRoleService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async upsertGrantRole({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<void> {
    const grantRoleSources = await this.findGrantRoleSources({
      workspaceId,
      applicationId,
    });

    if (!isDefined(grantRoleSources)) {
      return;
    }

    const {
      flatApplication,
      workspaceCustomFlatApplication,
      requestedFlatRole,
      grantFlatRole,
      grantFlatRoleTarget,
      flatEntityMaps,
    } = grantRoleSources;

    if (!isDefined(requestedFlatRole)) {
      this.logger.log(
        `Application ${flatApplication.universalIdentifier} has no default role in workspace ${workspaceId}, it gets no grant role`,
      );

      return;
    }

    const {
      featureFlagsMap,
      billingEntitlements,
      ...dependencyFlatEntityMaps
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      ...APPLICATION_GRANT_ROLE_DEPENDENCY_FLAT_ENTITY_MAPS_KEYS,
      'featureFlagsMap',
      'billingEntitlements',
    ]);

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          workspaceId,
          buildOptions: {
            isSystemBuild: true,
            inferDeletionFromMissingEntities: true,
            applicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
          },
          fromToAllFlatEntityMaps:
            buildApplicationGrantRoleFromToFlatEntityMaps({
              targetFlatApplication: flatApplication,
              requestedFlatRole,
              existingGrantRole:
                isDefined(grantFlatRole) && isDefined(grantFlatRoleTarget)
                  ? {
                      flatRole: grantFlatRole,
                      flatRoleTarget: grantFlatRoleTarget,
                    }
                  : undefined,
              workspaceCustomApplicationUniversalIdentifier:
                workspaceCustomFlatApplication.universalIdentifier,
              flatEntityMaps,
              now: new Date().toISOString(),
            }),
          // The builder mutates these maps, so it must not get the cache's own
          dependencyAllFlatEntityMaps: structuredClone(
            dependencyFlatEntityMaps,
          ),
          additionalCacheDataMaps: { featureFlagsMap, billingEntitlements },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        'Validation errors occurred while writing an application grant role',
      );
    }
  }

  async deleteGrantRole({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<void> {
    const grantRoleSources = await this.findGrantRoleSources({
      workspaceId,
      applicationId,
    });

    if (!isDefined(grantRoleSources?.grantFlatRole)) {
      return;
    }

    const { grantFlatRole, workspaceCustomFlatApplication } = grantRoleSources;

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            role: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: [grantFlatRole],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        'Validation errors occurred while deleting an application grant role',
      );
    }
  }

  private async findGrantRoleSources({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }) {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatApplicationMaps, ...flatEntityMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
        'flatRoleMaps',
        'flatRoleTargetMaps',
        'flatObjectPermissionMaps',
        'flatFieldPermissionMaps',
        'flatRolePermissionFlagMaps',
        'flatRowLevelPermissionPredicateMaps',
        'flatRowLevelPermissionPredicateGroupMaps',
      ]);

    const flatApplication = findActiveFlatApplicationById(
      flatApplicationMaps,
      applicationId,
    );

    if (
      !isDefined(flatApplication) ||
      !canApplicationHaveGrantRole({
        flatApplication,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      })
    ) {
      return undefined;
    }

    const grantFlatRoleTarget = findApplicationGrantRoleFlatRoleTarget({
      flatRoleTargetMaps: flatEntityMaps.flatRoleTargetMaps,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
    });

    const grantFlatRole = isDefined(grantFlatRoleTarget)
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier: grantFlatRoleTarget.roleUniversalIdentifier,
          flatEntityMaps: flatEntityMaps.flatRoleMaps,
        })
      : undefined;

    const requestedFlatRole = isDefined(flatApplication.defaultRoleId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatApplication.defaultRoleId,
          flatEntityMaps: flatEntityMaps.flatRoleMaps,
        })
      : undefined;

    return {
      flatApplication,
      workspaceCustomFlatApplication,
      requestedFlatRole,
      grantFlatRole,
      grantFlatRoleTarget,
      flatEntityMaps,
    };
  }
}
