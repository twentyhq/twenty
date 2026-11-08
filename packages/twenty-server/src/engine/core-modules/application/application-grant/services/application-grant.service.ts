import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  APPLICATION_GRANT_DEPENDENCY_FLAT_ENTITY_MAPS_KEYS,
  buildApplicationGrantFromToFlatEntityMaps,
} from 'src/engine/core-modules/application/application-grant/utils/build-application-grant-from-to-flat-entity-maps.util';
import { findApplicationGrantFlatRoleTarget } from 'src/engine/core-modules/application/application-grant/utils/find-application-grant-flat-role-target.util';
import { isApplicationGrantable } from 'src/engine/core-modules/application/application-grant/utils/is-application-grantable.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// A grant is a non-editable copy of an application's requested role, owned by the
// workspace custom application and assigned to the application through a role target.
// See twentyhq/core-team-issues#3139.
@Injectable()
export class ApplicationGrantService {
  private readonly logger = new Logger(ApplicationGrantService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async syncGrant({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<void> {
    const state = await this.loadGrantState({ workspaceId, applicationId });

    if (!isDefined(state)) {
      return;
    }

    const {
      flatApplication,
      workspaceCustomFlatApplication,
      requestedFlatRole,
      grantFlatRole,
      grantFlatRoleTarget,
      flatEntityMaps,
    } = state;

    if (!isDefined(requestedFlatRole)) {
      this.logger.log(
        `Application ${flatApplication.universalIdentifier} has no default role in workspace ${workspaceId}, it gets no grant`,
      );

      return;
    }

    const {
      featureFlagsMap,
      billingEntitlements,
      ...dependencyFlatEntityMaps
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      ...APPLICATION_GRANT_DEPENDENCY_FLAT_ENTITY_MAPS_KEYS,
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
          fromToAllFlatEntityMaps: buildApplicationGrantFromToFlatEntityMaps({
            targetFlatApplication: flatApplication,
            requestedFlatRole,
            existingGrant:
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
        'Validation errors occurred while writing an application grant',
      );
    }
  }

  async deleteGrant({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<void> {
    const state = await this.loadGrantState({ workspaceId, applicationId });

    if (!isDefined(state) || !isDefined(state.grantFlatRole)) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            state.workspaceCustomFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            role: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: [state.grantFlatRole],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        'Validation errors occurred while deleting an application grant',
      );
    }
  }

  private async loadGrantState({
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
      !isApplicationGrantable({
        flatApplication,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      })
    ) {
      return undefined;
    }

    const grantFlatRoleTarget = findApplicationGrantFlatRoleTarget({
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
