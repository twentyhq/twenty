import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillWorkspaceCustomApplicationDefaultRoleCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792755720300-backfill-workspace-custom-application-default-role.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  WORKSPACE_CUSTOM_APPLICATION_ROLE_LABEL,
  WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/engine/core-modules/application/constants/workspace-custom-application-role.constant';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const CUSTOM_APPLICATION_ID = '20202020-0000-4000-8000-0000000000a2';

type RoleMigrationArgs = {
  allFlatEntityOperationByMetadataName: {
    role: { flatEntityToCreate: FlatRole[] };
  };
  isSystemBuild: boolean;
  applicationUniversalIdentifier: string;
};

const buildExistingRole = (label: string): FlatRole =>
  ({
    id: `role-${label}`,
    universalIdentifier: `universal-${label}`,
    label,
  }) as FlatRole;

describe('BackfillWorkspaceCustomApplicationDefaultRoleCommand', () => {
  let customApplicationDefaultRoleId: string | null;
  let roles: FlatRole[];
  let migrationCalls: RoleMigrationArgs[];
  let command: BackfillWorkspaceCustomApplicationDefaultRoleCommand;

  const getCustomApplicationRole = () =>
    roles.find(
      (role) =>
        role.universalIdentifier ===
        WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
    );

  beforeEach(() => {
    customApplicationDefaultRoleId = null;
    roles = [buildExistingRole('Admin'), buildExistingRole('Member')];
    migrationCalls = [];

    const workspaceCacheService = {
      getOrRecompute: jest.fn(async () => ({
        flatRoleMaps: {
          byUniversalIdentifier: Object.fromEntries(
            roles.map((role) => [role.universalIdentifier, role]),
          ),
        },
      })),
    } as unknown as WorkspaceCacheService;

    const applicationService = {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.fn(
        async () => ({
          workspaceCustomFlatApplication: {
            id: CUSTOM_APPLICATION_ID,
            universalIdentifier: CUSTOM_APPLICATION_ID,
            defaultRoleId: customApplicationDefaultRoleId,
          },
        }),
      ),
      update: jest.fn(
        async (_id: string, { defaultRoleId }: { defaultRoleId: string }) => {
          customApplicationDefaultRoleId = defaultRoleId;
        },
      ),
    } as unknown as ApplicationService;

    const workspaceMigrationValidateBuildAndRunService = {
      validateBuildAndRunWorkspaceMigration: jest.fn(
        async (args: RoleMigrationArgs) => {
          migrationCalls.push(args);
          roles = [
            ...roles,
            ...args.allFlatEntityOperationByMetadataName.role
              .flatEntityToCreate,
          ];

          return { status: 'success' };
        },
      ),
    } as unknown as WorkspaceMigrationValidateBuildAndRunService;

    command = new BackfillWorkspaceCustomApplicationDefaultRoleCommand(
      {} as WorkspaceIteratorService,
      workspaceCacheService,
      applicationService,
      workspaceMigrationValidateBuildAndRunService,
    );

    jest.spyOn(command['logger'], 'log').mockImplementation();
  });

  const run = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('creates a locked, Admin-equivalent role owned by the custom application and sets it as its default role', async () => {
    await run();

    const customApplicationRole = getCustomApplicationRole();

    expect(customApplicationRole).toMatchObject({
      label: WORKSPACE_CUSTOM_APPLICATION_ROLE_LABEL,
      applicationId: CUSTOM_APPLICATION_ID,
      isEditable: false,
      canUpdateAllSettings: true,
      canAccessAllTools: true,
      canAccessAllAgentChatChannels: true,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      canBeAssignedToUsers: false,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
    });
    expect(customApplicationDefaultRoleId).toBe(customApplicationRole?.id);
    expect(migrationCalls).toMatchObject([
      {
        isSystemBuild: true,
        applicationUniversalIdentifier: CUSTOM_APPLICATION_ID,
      },
    ]);
  });

  it('changes nothing on a second run', async () => {
    await run();

    const rolesAfterFirstRun = [...roles];
    const defaultRoleIdAfterFirstRun = customApplicationDefaultRoleId;

    migrationCalls = [];

    await run();

    expect(migrationCalls).toEqual([]);
    expect(roles).toEqual(rolesAfterFirstRun);
    expect(customApplicationDefaultRoleId).toBe(defaultRoleIdAfterFirstRun);
  });

  it('leaves a custom application that already has a default role alone', async () => {
    customApplicationDefaultRoleId = 'role-Member';

    await run();

    expect(customApplicationDefaultRoleId).toBe('role-Member');
    expect(getCustomApplicationRole()).toBeUndefined();
  });

  it('picks a free label when a role already uses the default one', async () => {
    roles.push(
      buildExistingRole(WORKSPACE_CUSTOM_APPLICATION_ROLE_LABEL),
      buildExistingRole(`${WORKSPACE_CUSTOM_APPLICATION_ROLE_LABEL} 2`),
    );

    await run();

    expect(getCustomApplicationRole()?.label).toBe(
      `${WORKSPACE_CUSTOM_APPLICATION_ROLE_LABEL} 3`,
    );
  });

  it('writes nothing in dry-run mode', async () => {
    await run(true);

    expect(migrationCalls).toEqual([]);
    expect(customApplicationDefaultRoleId).toBeNull();
  });
});
