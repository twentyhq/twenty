import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { buildApplicationGrantDeletionFlatEntityOperations } from 'src/engine/core-modules/application/application-grant/utils/build-application-grant-deletion-flat-entity-operations.util';
import {
  buildApplicationGrantFlatEntityOperations,
  type ApplicationGrantFlatEntityOperations,
} from 'src/engine/core-modules/application/application-grant/utils/build-application-grant-flat-entity-operations.util';
import { findApplicationGrantFlatRoleTarget } from 'src/engine/core-modules/application/application-grant/utils/find-application-grant-flat-role-target.util';
import { isApplicationGrantable } from 'src/engine/core-modules/application/application-grant/utils/is-application-grantable.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
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

      if (isDefined(grantFlatRole)) {
        await this.runGrantMigration({
          workspaceId,
          workspaceCustomFlatApplication,
          operations: buildApplicationGrantDeletionFlatEntityOperations({
            grantFlatRole,
            flatEntityMaps,
          }),
        });
      }

      return;
    }

    await this.runGrantMigration({
      workspaceId,
      workspaceCustomFlatApplication,
      operations: buildApplicationGrantFlatEntityOperations({
        targetFlatApplication: flatApplication,
        requestedFlatRole,
        existingGrantFlatRole: grantFlatRole,
        existingGrantFlatRoleTarget: grantFlatRoleTarget,
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatEntityMaps,
        now: new Date().toISOString(),
      }),
    });
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

    await this.runGrantMigration({
      workspaceId,
      workspaceCustomFlatApplication: state.workspaceCustomFlatApplication,
      operations: buildApplicationGrantDeletionFlatEntityOperations({
        grantFlatRole: state.grantFlatRole,
        flatEntityMaps: state.flatEntityMaps,
      }),
    });
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

  private async runGrantMigration({
    workspaceId,
    workspaceCustomFlatApplication,
    operations,
  }: {
    workspaceId: string;
    workspaceCustomFlatApplication: FlatApplication;
    operations: ApplicationGrantFlatEntityOperations;
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: operations,
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        'Validation errors occurred while writing an application grant',
      );
    }
  }
}
