import { Injectable, Logger } from '@nestjs/common';

import {
  computeGrantLockedRequirement,
  type Manifest,
  materializeRoleManifestObjectPermissions,
  OBJECT_PERMISSION_ACTIONS,
  ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION,
  type RoleManifest,
  type RoleManifestGrant,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationGrantRestrictionsService } from 'src/engine/core-modules/application/application-grant/services/application-grant-restrictions.service';
import { fromRoleManifestGrantToApplicationGrantPermissionDto } from 'src/engine/core-modules/application/application-grant/utils/from-role-manifest-grant-to-application-grant-permission-dto.util';
import { type ApplicationGrantDTO } from 'src/engine/core-modules/application/application-grant/dtos/application-grant.dto';
import {
  addRoleManifestGrants,
  removeRoleManifestGrants,
} from 'src/engine/core-modules/application/application-grant/utils/apply-role-manifest-grants.util';
import { buildGrantFlatEntityOperations } from 'src/engine/core-modules/application/application-grant/utils/build-grant-flat-entity-operations.util';
import { assertGrantKeepsLockedRequirement } from 'src/engine/core-modules/application/application-grant/utils/assert-grant-keeps-locked-requirement.util';
import { buildInstallGrantRoleManifest } from 'src/engine/core-modules/application/application-grant/utils/build-install-grant-role-manifest.util';
import {
  computeGrantNarrowedPermissions,
  computeGrantPendingPermissions,
} from 'src/engine/core-modules/application/application-grant/utils/compute-grant-pending-permissions.util';
import { fromFlatRoleToGrantRoleManifest } from 'src/engine/core-modules/application/application-grant/utils/from-flat-role-to-grant-role-manifest.util';
import { isApplicationExemptFromGrant } from 'src/engine/core-modules/application/application-grant/utils/is-application-exempt-from-grant.util';
import { findRequestedRoleManifest } from 'src/engine/core-modules/application/application-grant/utils/normalize-confined-application-manifest.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const GRANT_FLAT_MAPS_KEYS = [
  'flatRoleMaps',
  'flatObjectPermissionMaps',
  'flatRolePermissionFlagMaps',
  'flatRoleTargetMaps',
  'flatAgentMaps',
  'flatObjectMetadataMaps',
  'flatPermissionFlagMaps',
] as const;

type GrantFlatMaps = Pick<
  AllFlatEntityMaps,
  (typeof GRANT_FLAT_MAPS_KEYS)[number]
>;

export type ApplicationGrantState = {
  application: FlatApplication;
  workspaceCustomFlatApplication: FlatApplication;
  flatMaps: GrantFlatMaps;
  requestedFlatRole: FlatRole | undefined;
  requestedRoleManifest: RoleManifest;
  grantFlatRole: FlatRole | undefined;
  grantRoleManifest: RoleManifest | undefined;
  approvedRoleManifest: RoleManifest;
  pendingPermissions: RoleManifestGrant[];
};

const EMPTY_REQUESTED_ROLE_MANIFEST: RoleManifest = {
  universalIdentifier: 'no-requested-role',
  label: 'No requested role',
};

@Injectable()
export class ApplicationGrantService {
  private readonly logger = new Logger(ApplicationGrantService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationGrantRestrictionsService: ApplicationGrantRestrictionsService,
  ) {}

  async loadGrantState({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<ApplicationGrantState> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const application = flatApplicationMaps.byId[applicationId];

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application ${applicationId} not found`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const flatMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: [...GRANT_FLAT_MAPS_KEYS] },
      );

    const findFlatRoleById = (roleId: string | null | undefined) => {
      if (!isDefined(roleId)) {
        return undefined;
      }

      const universalIdentifier =
        flatMaps.flatRoleMaps.universalIdentifierById[roleId];

      return isDefined(universalIdentifier)
        ? flatMaps.flatRoleMaps.byUniversalIdentifier[universalIdentifier]
        : undefined;
    };

    const requestedFlatRole = findFlatRoleById(application.defaultRoleId);
    const requestedRoleManifest = isDefined(requestedFlatRole)
      ? fromFlatRoleToGrantRoleManifest({
          flatRole: requestedFlatRole,
          ...flatMaps,
        })
      : EMPTY_REQUESTED_ROLE_MANIFEST;

    const grantRoleTarget = Object.values(
      flatMaps.flatRoleTargetMaps.byUniversalIdentifier,
    ).find(
      (flatRoleTarget) => flatRoleTarget?.targetApplicationId === applicationId,
    );
    const grantFlatRole = findFlatRoleById(grantRoleTarget?.roleId);
    const grantRoleManifest = isDefined(grantFlatRole)
      ? fromFlatRoleToGrantRoleManifest({
          flatRole: grantFlatRole,
          ...flatMaps,
        })
      : undefined;

    const approvedRoleManifest =
      application.approvedRoleRequest ?? requestedRoleManifest;

    return {
      application,
      workspaceCustomFlatApplication,
      flatMaps,
      requestedFlatRole,
      requestedRoleManifest,
      grantFlatRole,
      grantRoleManifest,
      approvedRoleManifest,
      pendingPermissions: isDefined(grantRoleManifest)
        ? computeGrantPendingPermissions({
            requestedRoleManifest,
            approvedRoleManifest,
            grantRoleManifest,
          })
        : [],
    };
  }

  async getGrant({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<ApplicationGrantDTO> {
    const state = await this.loadGrantState({ workspaceId, applicationId });
    const { flatObjectMetadataMaps, flatPermissionFlagMaps } = state.flatMaps;

    return {
      applicationId,
      grantRoleId: state.grantFlatRole?.id ?? null,
      requestedRoleId: state.requestedFlatRole?.id ?? null,
      applicationVersion:
        state.application.requestedRoleVersion ?? state.application.version,
      requestedAllObjectsActions: OBJECT_PERMISSION_ACTIONS.filter(
        (action) =>
          state.approvedRoleManifest[
            ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action]
          ] === true,
      ),
      lockedObjectPermissions: (
        computeGrantLockedRequirement(state.approvedRoleManifest)
          .objectPermissions ?? []
      ).flatMap((objectPermission) => {
        const objectMetadataId =
          flatObjectMetadataMaps.byUniversalIdentifier[
            objectPermission.objectUniversalIdentifier
          ]?.id;

        return isDefined(objectMetadataId)
          ? [
              {
                objectMetadataId,
                canReadObjectRecords:
                  objectPermission.canReadObjectRecords ?? false,
                canUpdateObjectRecords:
                  objectPermission.canUpdateObjectRecords ?? false,
                canSoftDeleteObjectRecords:
                  objectPermission.canSoftDeleteObjectRecords ?? false,
                canDestroyObjectRecords:
                  objectPermission.canDestroyObjectRecords ?? false,
              },
            ]
          : [];
      }),
      pendingPermissions: state.pendingPermissions.map((grant) =>
        fromRoleManifestGrantToApplicationGrantPermissionDto({
          grant,
          flatObjectMetadataMaps,
          flatPermissionFlagMaps,
        }),
      ),
    };
  }

  async getGrantRoleIdOrThrow({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<string> {
    const state = await this.loadGrantState({ workspaceId, applicationId });

    if (!isDefined(state.grantFlatRole)) {
      throw new ApplicationException(
        `Application ${applicationId} has no granted role`,
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    return state.grantFlatRole.id;
  }

  // Runs after each manifest sync of a confined application: creates the grant on first install,
  // applies a narrower request right away, and mirrors the request for LOCAL (dev) applications.
  async reconcileGrantAfterManifestSync({
    workspaceId,
    applicationId,
    manifest,
    installGrantRoleManifest,
    requestVersion,
  }: {
    workspaceId: string;
    applicationId: string;
    manifest: Manifest;
    installGrantRoleManifest?: RoleManifest;
    requestVersion?: string;
  }): Promise<void> {
    if (isDefined(requestVersion)) {
      await this.applicationService.update(applicationId, {
        workspaceId,
        requestedRoleVersion: requestVersion,
      });
    }

    const state = await this.loadGrantState({ workspaceId, applicationId });

    if (
      isApplicationExemptFromGrant({
        application: state.application,
        workspaceCustomApplicationId: state.workspaceCustomFlatApplication.id,
      })
    ) {
      return;
    }

    const isLocal =
      state.application.sourceType === ApplicationRegistrationSourceType.LOCAL;

    const agentUniversalIdentifiers = this.findAgentsRunningWithGrant({
      manifest,
      flatAgentMaps: state.flatMaps.flatAgentMaps,
    });

    if (!isDefined(state.grantRoleManifest)) {
      const customizedGrantRoleManifest = isLocal
        ? undefined
        : installGrantRoleManifest;

      const desiredRoleManifest = isDefined(customizedGrantRoleManifest)
        ? buildInstallGrantRoleManifest({
            requestedRoleManifest: state.requestedRoleManifest,
            customizedGrantRoleManifest,
          })
        : materializeRoleManifestObjectPermissions(state.requestedRoleManifest);

      assertGrantKeepsLockedRequirement({
        approvedRoleManifest: state.requestedRoleManifest,
        grantRoleManifest: desiredRoleManifest,
      });

      await this.writeGrant({
        state,
        desiredRoleManifest,
        approvedRoleManifest: state.requestedRoleManifest,
        agentUniversalIdentifiers,
      });

      if (isDefined(customizedGrantRoleManifest)) {
        await this.applicationGrantRestrictionsService.writeInstallRestrictions({
          workspaceId,
          grantRoleId: await this.getGrantRoleIdOrThrow({
            workspaceId,
            applicationId,
          }),
          grantRoleManifest: customizedGrantRoleManifest,
        });
      }

      return;
    }

    const narrowedPermissions = computeGrantNarrowedPermissions({
      requestedRoleManifest: state.requestedRoleManifest,
      approvedRoleManifest: state.approvedRoleManifest,
    });

    let approvedRoleManifest = removeRoleManifestGrants({
      roleManifest: state.approvedRoleManifest,
      grants: narrowedPermissions,
    });
    let desiredRoleManifest = this.withTakeItOrLeaveItSwitches({
      roleManifest: removeRoleManifestGrants({
        roleManifest: state.grantRoleManifest,
        grants: narrowedPermissions,
      }),
      approvedRoleManifest,
    });

    if (isLocal) {
      desiredRoleManifest = addRoleManifestGrants({
        roleManifest: desiredRoleManifest,
        grants: computeGrantPendingPermissions({
          requestedRoleManifest: state.requestedRoleManifest,
          approvedRoleManifest,
          grantRoleManifest: desiredRoleManifest,
        }),
      });
      approvedRoleManifest = state.requestedRoleManifest;
    }

    await this.writeGrant({
      state,
      desiredRoleManifest,
      approvedRoleManifest,
      agentUniversalIdentifiers,
    });
  }

  async approvePendingPermissions({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<void> {
    const state = await this.loadGrantState({ workspaceId, applicationId });

    const grantRoleManifest = this.getGrantRoleManifestOrThrow(state);

    await this.writeGrant({
      state,
      desiredRoleManifest: this.withTakeItOrLeaveItSwitches({
        roleManifest: addRoleManifestGrants({
          roleManifest: grantRoleManifest,
          grants: state.pendingPermissions,
        }),
        approvedRoleManifest: state.requestedRoleManifest,
      }),
      approvedRoleManifest: state.requestedRoleManifest,
    });
  }

  // Admin edits of object access: scope of the "all objects" switches and additions on top of the request
  async updateGrantObjectAccess({
    workspaceId,
    applicationId,
    allObjectsActions,
    objectPermissions,
  }: {
    workspaceId: string;
    applicationId: string;
    allObjectsActions: Partial<
      Record<(typeof OBJECT_PERMISSION_ACTIONS)[number], boolean>
    >;
    objectPermissions: {
      objectMetadataId: string;
      canReadObjectRecords?: boolean | null;
      canUpdateObjectRecords?: boolean | null;
      canSoftDeleteObjectRecords?: boolean | null;
      canDestroyObjectRecords?: boolean | null;
    }[];
  }): Promise<void> {
    const state = await this.loadGrantState({ workspaceId, applicationId });

    const grantRoleManifest = this.getGrantRoleManifestOrThrow(state);

    const desiredRoleManifest: RoleManifest = {
      ...grantRoleManifest,
      ...Object.fromEntries(
        OBJECT_PERMISSION_ACTIONS.map((action) => [
          ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action],
          allObjectsActions[action] ??
            grantRoleManifest[
              ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action]
            ] ??
            false,
        ]),
      ),
      objectPermissions: objectPermissions.map(
        ({ objectMetadataId, ...actions }) => {
          const objectUniversalIdentifier =
            state.flatMaps.flatObjectMetadataMaps.universalIdentifierById[
              objectMetadataId
            ];

          if (!isDefined(objectUniversalIdentifier)) {
            throw new ApplicationException(
              `Object ${objectMetadataId} not found`,
              ApplicationExceptionCode.INVALID_INPUT,
            );
          }

          return {
            objectUniversalIdentifier,
            ...Object.fromEntries(
              OBJECT_PERMISSION_ACTIONS.flatMap((action) =>
                isDefined(actions[action]) ? [[action, actions[action]]] : [],
              ),
            ),
          };
        },
      ),
    };

    assertGrantKeepsLockedRequirement({
      approvedRoleManifest: state.approvedRoleManifest,
      grantRoleManifest: desiredRoleManifest,
    });

    await this.writeGrant({
      state,
      desiredRoleManifest,
      approvedRoleManifest: state.approvedRoleManifest,
    });
  }

  private getGrantRoleManifestOrThrow(state: ApplicationGrantState) {
    if (!isDefined(state.grantRoleManifest)) {
      throw new ApplicationException(
        `Application ${state.application.id} has no granted role`,
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    return state.grantRoleManifest;
  }

  // Settings, tools and agent chat switches and permission flags are take it or leave it: always as approved
  private withTakeItOrLeaveItSwitches({
    roleManifest,
    approvedRoleManifest,
  }: {
    roleManifest: RoleManifest;
    approvedRoleManifest: RoleManifest;
  }): RoleManifest {
    return {
      ...roleManifest,
      canUpdateAllSettings: approvedRoleManifest.canUpdateAllSettings ?? false,
      canAccessAllTools: approvedRoleManifest.canAccessAllTools ?? false,
      canAccessAllAgentChatChannels:
        approvedRoleManifest.canAccessAllAgentChatChannels ?? false,
      permissionFlagUniversalIdentifiers:
        approvedRoleManifest.permissionFlagUniversalIdentifiers ?? [],
    };
  }

  private findAgentsRunningWithGrant({
    manifest,
    flatAgentMaps,
  }: {
    manifest: Manifest;
  } & Pick<GrantFlatMaps, 'flatAgentMaps'>): string[] {
    const requestedRoleUniversalIdentifier =
      findRequestedRoleManifest(manifest)?.universalIdentifier;

    if (!isDefined(requestedRoleUniversalIdentifier)) {
      return [];
    }

    return (manifest.agents ?? [])
      .filter(
        (agentManifest) =>
          agentManifest.roleUniversalIdentifier ===
            requestedRoleUniversalIdentifier &&
          isDefined(
            flatAgentMaps.byUniversalIdentifier[
              agentManifest.universalIdentifier
            ],
          ),
      )
      .map((agentManifest) => agentManifest.universalIdentifier);
  }

  private findCurrentAgentsRunningWithGrant(
    state: ApplicationGrantState,
  ): string[] {
    if (!isDefined(state.grantFlatRole)) {
      return [];
    }

    const grantRoleUniversalIdentifier =
      state.grantFlatRole.universalIdentifier;

    return Object.values(
      state.flatMaps.flatRoleTargetMaps.byUniversalIdentifier,
    )
      .filter(
        (flatRoleTarget) =>
          flatRoleTarget?.roleUniversalIdentifier ===
          grantRoleUniversalIdentifier,
      )
      .map((flatRoleTarget) => flatRoleTarget?.agentUniversalIdentifier)
      .filter(isDefined);
  }

  private computeGrantRoleLabel(state: ApplicationGrantState): string {
    if (isDefined(state.grantFlatRole)) {
      return state.grantFlatRole.label;
    }

    const existingLabels = new Set(
      Object.values(state.flatMaps.flatRoleMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map((flatRole) => flatRole.label),
    );
    const baseLabel = `${state.application.name} role`;

    let label = baseLabel;
    let suffix = 2;

    while (existingLabels.has(label)) {
      label = `${baseLabel} ${suffix}`;
      suffix++;
    }

    return label;
  }

  private async writeGrant({
    state,
    desiredRoleManifest,
    approvedRoleManifest,
    agentUniversalIdentifiers,
  }: {
    state: ApplicationGrantState;
    desiredRoleManifest: RoleManifest;
    approvedRoleManifest: RoleManifest;
    agentUniversalIdentifiers?: string[];
  }): Promise<void> {
    const grantRoleUniversalIdentifier =
      state.grantFlatRole?.universalIdentifier ?? v4();

    const operations = buildGrantFlatEntityOperations({
      applicationId: state.application.id,
      existingFlatRole: state.grantFlatRole,
      desiredRoleManifest,
      grantRoleUniversalIdentifier,
      grantRoleLabel: this.computeGrantRoleLabel(state),
      agentUniversalIdentifiers:
        agentUniversalIdentifiers ??
        this.findCurrentAgentsRunningWithGrant(state),
      workspaceCustomApplicationUniversalIdentifier:
        state.workspaceCustomFlatApplication.universalIdentifier,
      flatObjectPermissionMaps: state.flatMaps.flatObjectPermissionMaps,
      flatRolePermissionFlagMaps: state.flatMaps.flatRolePermissionFlagMaps,
      flatRoleTargetMaps: state.flatMaps.flatRoleTargetMaps,
    });

    const hasOperations = Object.values(operations).some(
      (operation) =>
        operation.flatEntityToCreate.length > 0 ||
        operation.flatEntityToUpdate.length > 0 ||
        operation.flatEntityToDelete.length > 0,
    );

    if (hasOperations) {
      // A system build: the grant is not editable through the generic role APIs
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: operations,
            workspaceId: state.application.workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier:
              state.workspaceCustomFlatApplication.universalIdentifier,
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Application grant validation failed: ${JSON.stringify(result.report)}`,
        );

        throw new WorkspaceMigrationBuilderException(
          result,
          'Validation errors occurred while writing the application grant',
        );
      }
    }

    await this.applicationService.update(state.application.id, {
      workspaceId: state.application.workspaceId,
      approvedRoleRequest: () =>
        `'${JSON.stringify(approvedRoleManifest).replace(/'/g, "''")}'::jsonb`,
    });

    this.logger.log(
      `Application grant written for application ${state.application.id}`,
    );
  }

  async deleteGrant({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<void> {
    const state = await this.loadGrantState({ workspaceId, applicationId });

    if (!isDefined(state.grantFlatRole)) {
      return;
    }

    const grantRoleUniversalIdentifier =
      state.grantFlatRole.universalIdentifier;

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            role: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: [state.grantFlatRole],
            },
            roleTarget: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: Object.values(
                state.flatMaps.flatRoleTargetMaps.byUniversalIdentifier,
              )
                .filter(isDefined)
                .filter(
                  (flatRoleTarget) =>
                    flatRoleTarget.roleUniversalIdentifier ===
                    grantRoleUniversalIdentifier,
                ),
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            state.workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        'Validation errors occurred while deleting the application grant',
      );
    }
  }
}
