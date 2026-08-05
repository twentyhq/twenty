import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { FlagStandardActionCommandMenuItemsSystemSideEffectCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1786100001000-flag-standard-action-command-menu-items-system-side-effect.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const DELETE_RECORDS_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.deleteRecords.universalIdentifier;
const GO_TO_SETTINGS_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.goToSettings.universalIdentifier;

describe('FlagStandardActionCommandMenuItemsSystemSideEffectCommand', () => {
  let command: FlagStandardActionCommandMenuItemsSystemSideEffectCommand;
  let getOrRecomputeMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;
  let commandMenuItemUpdateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    invalidateCacheMock = jest.fn().mockResolvedValue(undefined);
    commandMenuItemUpdateMock = jest.fn().mockResolvedValue(undefined);

    const entityManagerMock = {
      getRepository: () => ({ update: commandMenuItemUpdateMock }),
    };

    const commandMenuItemRepositoryMock = {
      manager: {
        transaction: jest.fn(
          async (callback: (entityManager: unknown) => Promise<void>) =>
            callback(entityManagerMock),
        ),
      },
    };

    command = new FlagStandardActionCommandMenuItemsSystemSideEffectCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        invalidateCache: invalidateCacheMock,
      } as unknown as WorkspaceMigrationRunnerService,
      commandMenuItemRepositoryMock as never,
    );
  });

  const mockWorkspaceCache = (
    commandMenuItems: {
      id: string;
      universalIdentifier: string;
      isSystemSideEffect: boolean;
    }[],
  ) => {
    getOrRecomputeMock.mockResolvedValue({
      flatCommandMenuItemMaps: {
        byUniversalIdentifier: Object.fromEntries(
          commandMenuItems.map((commandMenuItem) => [
            commandMenuItem.universalIdentifier,
            commandMenuItem,
          ]),
        ),
      },
    });
  };

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('flags standard action commands still carrying isSystemSideEffect false', async () => {
    mockWorkspaceCache([
      {
        id: 'delete-records-id',
        universalIdentifier: DELETE_RECORDS_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: false,
      },
      {
        id: 'go-to-settings-id',
        universalIdentifier: GO_TO_SETTINGS_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: false,
      },
    ]);

    await runOnWorkspace();

    expect(commandMenuItemUpdateMock).toHaveBeenCalledTimes(2);
    expect(commandMenuItemUpdateMock).toHaveBeenCalledWith(
      { id: 'delete-records-id', workspaceId: WORKSPACE_ID },
      { isSystemSideEffect: true },
    );
    expect(commandMenuItemUpdateMock).toHaveBeenCalledWith(
      { id: 'go-to-settings-id', workspaceId: WORKSPACE_ID },
      { isSystemSideEffect: true },
    );
    expect(invalidateCacheMock).toHaveBeenCalledTimes(1);
  });

  it('is a noop when the rows already carry the flag or are absent', async () => {
    mockWorkspaceCache([
      {
        id: 'delete-records-id',
        universalIdentifier: DELETE_RECORDS_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
      {
        id: 'workflow-derived-id',
        universalIdentifier: 'workflow-derived-identifier',
        isSystemSideEffect: false,
      },
    ]);

    await runOnWorkspace();

    expect(commandMenuItemUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('does not write anything in dry-run mode', async () => {
    mockWorkspaceCache([
      {
        id: 'delete-records-id',
        universalIdentifier: DELETE_RECORDS_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: false,
      },
    ]);

    await runOnWorkspace(true);

    expect(commandMenuItemUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });
});
