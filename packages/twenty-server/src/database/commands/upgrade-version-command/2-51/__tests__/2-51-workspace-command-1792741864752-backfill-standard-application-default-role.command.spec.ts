import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillStandardApplicationDefaultRoleCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792741864752-backfill-standard-application-default-role.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const STANDARD_APPLICATION_ID = '20202020-0000-4000-8000-0000000000a1';
const ADMIN_ROLE_ID = 'role-admin';

describe('BackfillStandardApplicationDefaultRoleCommand', () => {
  let standardApplicationDefaultRoleId: string | null;
  let hasAdminRole: boolean;
  let command: BackfillStandardApplicationDefaultRoleCommand;

  beforeEach(() => {
    standardApplicationDefaultRoleId = null;
    hasAdminRole = true;

    const workspaceCacheService = {
      getOrRecompute: jest.fn(async () => ({
        flatRoleMaps: {
          byUniversalIdentifier: hasAdminRole
            ? {
                [STANDARD_ROLE.admin.universalIdentifier]: {
                  id: ADMIN_ROLE_ID,
                  universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
                },
              }
            : {},
        },
      })),
    } as unknown as WorkspaceCacheService;

    const applicationService = {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.fn(
        async () => ({
          twentyStandardFlatApplication: {
            id: STANDARD_APPLICATION_ID,
            defaultRoleId: standardApplicationDefaultRoleId,
          },
        }),
      ),
      update: jest.fn(
        async (_id: string, { defaultRoleId }: { defaultRoleId: string }) => {
          standardApplicationDefaultRoleId = defaultRoleId;
        },
      ),
    } as unknown as ApplicationService;

    command = new BackfillStandardApplicationDefaultRoleCommand(
      {} as WorkspaceIteratorService,
      workspaceCacheService,
      applicationService,
    );

    jest.spyOn(command['logger'], 'log').mockImplementation();
    jest.spyOn(command['logger'], 'warn').mockImplementation();
  });

  const run = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('sets Admin as the standard application default role', async () => {
    await run();

    expect(standardApplicationDefaultRoleId).toBe(ADMIN_ROLE_ID);
  });

  it('leaves a standard application that already has a default role alone', async () => {
    standardApplicationDefaultRoleId = 'another-role';

    await run();

    expect(standardApplicationDefaultRoleId).toBe('another-role');
  });

  it('leaves the default role unset in a workspace without an Admin role', async () => {
    hasAdminRole = false;

    await expect(run()).resolves.toBeUndefined();

    expect(standardApplicationDefaultRoleId).toBeNull();
  });

  it('writes nothing in dry-run mode', async () => {
    await run(true);

    expect(standardApplicationDefaultRoleId).toBeNull();
  });
});
