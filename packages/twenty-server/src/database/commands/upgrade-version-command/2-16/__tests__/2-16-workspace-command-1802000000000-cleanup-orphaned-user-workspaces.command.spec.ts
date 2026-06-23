import { type Repository } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { CleanupOrphanedUserWorkspacesCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1802000000000-cleanup-orphaned-user-workspaces.command';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const OLD_DATE = new Date('2020-01-01T00:00:00.000Z');

type PartialUserWorkspace = Pick<
  UserWorkspaceEntity,
  'id' | 'userId' | 'workspaceId' | 'createdAt'
>;

const makeUserWorkspace = (
  overrides: Partial<PartialUserWorkspace> & { id: string; userId: string },
): PartialUserWorkspace => ({
  workspaceId: WORKSPACE_ID,
  createdAt: OLD_DATE,
  ...overrides,
});

describe('CleanupOrphanedUserWorkspacesCommand', () => {
  let command: CleanupOrphanedUserWorkspacesCommand;
  let userWorkspaceFind: jest.Mock;
  let workspaceMemberFind: jest.Mock;
  let deleteUserWorkspace: jest.Mock;

  beforeEach(() => {
    userWorkspaceFind = jest.fn();
    workspaceMemberFind = jest.fn();
    deleteUserWorkspace = jest.fn().mockResolvedValue(undefined);

    const userWorkspaceRepository = {
      find: userWorkspaceFind,
    } as unknown as Repository<UserWorkspaceEntity>;

    const userWorkspaceService = {
      deleteUserWorkspace,
    } as unknown as UserWorkspaceService;

    const workspaceMemberRepository = { find: workspaceMemberFind };

    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(
        async (fn: () => unknown) => await fn(),
      ),
      getRepository: jest.fn().mockResolvedValue(workspaceMemberRepository),
    } as unknown as GlobalWorkspaceOrmManager;

    command = new CleanupOrphanedUserWorkspacesCommand(
      {} as unknown as WorkspaceIteratorService,
      userWorkspaceRepository,
      userWorkspaceService,
      globalWorkspaceOrmManager,
    );

    // Silence and make assertable the command logger.
    (
      command as unknown as { logger: Record<string, jest.Mock> }
    ).logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
  });

  const run = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('deletes only the orphaned userWorkspace (no matching workspaceMember)', async () => {
    userWorkspaceFind.mockResolvedValue([
      makeUserWorkspace({ id: 'uw-a', userId: 'user-a' }),
      makeUserWorkspace({ id: 'uw-b', userId: 'user-b' }),
      makeUserWorkspace({ id: 'uw-orphan', userId: 'user-orphan' }),
    ]);
    workspaceMemberFind.mockResolvedValue([
      { userId: 'user-a' },
      { userId: 'user-b' },
    ]);

    await run();

    expect(deleteUserWorkspace).toHaveBeenCalledTimes(1);
    expect(deleteUserWorkspace).toHaveBeenCalledWith({
      userWorkspaceId: 'uw-orphan',
    });
  });

  it('includes soft-deleted workspaceMembers so they are not treated as orphans', async () => {
    userWorkspaceFind.mockResolvedValue([
      makeUserWorkspace({ id: 'uw-a', userId: 'user-a' }),
    ]);
    // The only member is soft-deleted but still present → not an orphan.
    workspaceMemberFind.mockResolvedValue([{ userId: 'user-a' }]);

    await run();

    expect(workspaceMemberFind).toHaveBeenCalledWith({ withDeleted: true });
    expect(deleteUserWorkspace).not.toHaveBeenCalled();
  });

  it('does nothing when every userWorkspace has a member', async () => {
    userWorkspaceFind.mockResolvedValue([
      makeUserWorkspace({ id: 'uw-a', userId: 'user-a' }),
      makeUserWorkspace({ id: 'uw-b', userId: 'user-b' }),
    ]);
    workspaceMemberFind.mockResolvedValue([
      { userId: 'user-a' },
      { userId: 'user-b' },
    ]);

    await run();

    expect(deleteUserWorkspace).not.toHaveBeenCalled();
  });

  it('does not delete anything in dry-run mode', async () => {
    userWorkspaceFind.mockResolvedValue([
      makeUserWorkspace({ id: 'uw-a', userId: 'user-a' }),
      makeUserWorkspace({ id: 'uw-orphan', userId: 'user-orphan' }),
    ]);
    workspaceMemberFind.mockResolvedValue([{ userId: 'user-a' }]);

    await run(true);

    expect(deleteUserWorkspace).not.toHaveBeenCalled();
  });

  it('refuses to delete when no workspaceMember is found at all', async () => {
    userWorkspaceFind.mockResolvedValue([
      makeUserWorkspace({ id: 'uw-a', userId: 'user-a' }),
    ]);
    workspaceMemberFind.mockResolvedValue([]);

    await run();

    expect(deleteUserWorkspace).not.toHaveBeenCalled();
  });

  it('refuses to delete when every userWorkspace would be orphaned', async () => {
    userWorkspaceFind.mockResolvedValue([
      makeUserWorkspace({ id: 'uw-a', userId: 'user-a' }),
      makeUserWorkspace({ id: 'uw-b', userId: 'user-b' }),
    ]);
    // Members exist but none match any userWorkspace.
    workspaceMemberFind.mockResolvedValue([{ userId: 'someone-else' }]);

    await run();

    expect(deleteUserWorkspace).not.toHaveBeenCalled();
  });

  it('skips orphaned userWorkspaces created within the safety window', async () => {
    userWorkspaceFind.mockResolvedValue([
      makeUserWorkspace({ id: 'uw-a', userId: 'user-a' }),
      makeUserWorkspace({
        id: 'uw-recent',
        userId: 'user-recent',
        createdAt: new Date(),
      }),
    ]);
    workspaceMemberFind.mockResolvedValue([{ userId: 'user-a' }]);

    await run();

    expect(deleteUserWorkspace).not.toHaveBeenCalled();
  });

  it('does nothing when the workspace has no userWorkspaces', async () => {
    userWorkspaceFind.mockResolvedValue([]);

    await run();

    expect(workspaceMemberFind).not.toHaveBeenCalled();
    expect(deleteUserWorkspace).not.toHaveBeenCalled();
  });
});
