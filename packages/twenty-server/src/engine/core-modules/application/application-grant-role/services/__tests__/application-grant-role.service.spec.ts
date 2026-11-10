import { ApplicationGrantRoleService } from 'src/engine/core-modules/application/application-grant-role/services/application-grant-role.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';

const grantFlatRole = {
  id: 'grant-role-id',
  universalIdentifier: 'grant-role-universal-identifier',
};

const buildService = ({
  defaultRoleId,
  hasGrant,
}: {
  defaultRoleId: string | null;
  hasGrant: boolean;
}) => {
  const flatRoleMaps = {
    ...createEmptyFlatEntityMaps(),
    byUniversalIdentifier: hasGrant
      ? { [grantFlatRole.universalIdentifier]: grantFlatRole }
      : {},
    universalIdentifierById: hasGrant
      ? { [grantFlatRole.id]: grantFlatRole.universalIdentifier }
      : {},
  };

  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatApplicationMaps: {
        byId: {
          [APPLICATION_ID]: {
            id: APPLICATION_ID,
            universalIdentifier: 'application-universal-identifier',
            sourceType: ApplicationRegistrationSourceType.NPM,
            defaultRoleId,
            deletedAt: null,
          },
        },
        idByUniversalIdentifier: {},
      },
      flatRoleTargetByApplicationIdMaps: hasGrant
        ? {
            [APPLICATION_ID]: {
              roleId: grantFlatRole.id,
              roleUniversalIdentifier: grantFlatRole.universalIdentifier,
            },
          }
        : {},
      flatRoleMaps,
      flatRoleTargetMaps: createEmptyFlatEntityMaps(),
      flatObjectPermissionMaps: createEmptyFlatEntityMaps(),
      flatFieldPermissionMaps: createEmptyFlatEntityMaps(),
      flatRolePermissionFlagMaps: createEmptyFlatEntityMaps(),
      flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
      flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
    }),
  };
  const workspaceMigrationValidateBuildAndRunService = {
    validateBuildAndRunWorkspaceMigration: jest
      .fn()
      .mockResolvedValue({ status: 'success' }),
    validateBuildAndRunWorkspaceMigrationFromTo: jest
      .fn()
      .mockResolvedValue({ status: 'success' }),
  };
  const applicationService = {
    findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
      .fn()
      .mockResolvedValue({
        workspaceCustomFlatApplication: {
          id: 'workspace-custom-application-id',
          universalIdentifier: 'workspace-custom-application-universal-id',
        },
      }),
  };

  return {
    service: new ApplicationGrantRoleService(
      applicationService as unknown as ApplicationService,
      workspaceCacheService as unknown as WorkspaceCacheService,
      workspaceMigrationValidateBuildAndRunService as unknown as WorkspaceMigrationValidateBuildAndRunService,
    ),
    workspaceMigrationValidateBuildAndRunService,
  };
};

describe('ApplicationGrantRoleService', () => {
  describe('upsertGrantRole for an application whose requested role is gone', () => {
    it('deletes the grant it still has', async () => {
      const { service, workspaceMigrationValidateBuildAndRunService } =
        buildService({ defaultRoleId: null, hasGrant: true });

      await service.upsertGrantRole({
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
      });

      expect(
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: WORKSPACE_ID,
          allFlatEntityOperationByMetadataName: {
            role: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: [grantFlatRole],
            },
          },
        }),
      );
      expect(
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo,
      ).not.toHaveBeenCalled();
    });

    it('writes nothing when it has no grant', async () => {
      const { service, workspaceMigrationValidateBuildAndRunService } =
        buildService({ defaultRoleId: null, hasGrant: false });

      await service.upsertGrantRole({
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
      });

      expect(
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
      ).not.toHaveBeenCalled();
      expect(
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo,
      ).not.toHaveBeenCalled();
    });
  });
});
