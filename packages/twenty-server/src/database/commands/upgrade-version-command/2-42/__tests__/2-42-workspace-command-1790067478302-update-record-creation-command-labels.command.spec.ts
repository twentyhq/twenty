import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { UpdateRecordCreationCommandLabelsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790067478302-update-record-creation-command-labels.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.createNewRecord.universalIdentifier;
const EXISTING_COMMAND = {
  id: 'create-record',
  universalIdentifier: UNIVERSAL_IDENTIFIER,
  label: 'Create new {objectLabelSingular}',
  shortLabel: 'New {objectLabelSingular}',
  icon: 'IconPlus',
  isPinned: true,
};
const ARGS = { workspaceId: 'workspace-id', options: {}, index: 0, total: 1 };

const getOrRecompute = jest.fn();
const migrate = jest.fn();
const command = new UpdateRecordCreationCommandLabelsCommand(
  {} as WorkspaceIteratorService,
  { getOrRecompute } as unknown as WorkspaceCacheService,
  {
    validateBuildAndRunLegacyWorkspaceMigration: migrate,
  } as unknown as WorkspaceMigrationValidateBuildAndRunService,
);

const mockCommand = (
  fields: { label?: string; shortLabel?: string | null } = {},
) => {
  getOrRecompute.mockResolvedValue({
    flatCommandMenuItemMaps: {
      byUniversalIdentifier: {
        [UNIVERSAL_IDENTIFIER]: { ...EXISTING_COMMAND, ...fields },
      },
    },
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  migrate.mockResolvedValue({ status: 'success' });
  mockCommand();
});

it('updates existing labels through a legacy standard metadata migration', async () => {
  await command.runOnWorkspace(ARGS);

  expect(migrate).toHaveBeenCalledWith({
    isSystemBuild: true,
    workspaceId: ARGS.workspaceId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    allFlatEntityOperationByMetadataName: {
      commandMenuItem: {
        flatEntityToCreate: [],
        flatEntityToDelete: [],
        flatEntityToUpdate: [
          {
            ...EXISTING_COMMAND,
            label: 'Create {objectLabelSingular}',
            shortLabel: 'Create',
            updatedAt: expect.any(String),
          },
        ],
      },
    },
  });
});

it.each([null, 'Add'])(
  'preserves a hidden or customized short label (%s)',
  async (shortLabel) => {
    mockCommand({ shortLabel });
    await command.up(ARGS);
    expect(
      migrate.mock.calls[0][0].allFlatEntityOperationByMetadataName
        .commandMenuItem.flatEntityToUpdate[0],
    ).toMatchObject({ label: 'Create {objectLabelSingular}', shortLabel });
  },
);

it('preserves a customized full label while updating the old short label', async () => {
  mockCommand({ label: 'Add a customer' });
  await command.up(ARGS);
  expect(
    migrate.mock.calls[0][0].allFlatEntityOperationByMetadataName
      .commandMenuItem.flatEntityToUpdate[0],
  ).toMatchObject({ label: 'Add a customer', shortLabel: 'Create' });
});

it('does nothing when labels are already updated', async () => {
  mockCommand({ label: 'Create {objectLabelSingular}', shortLabel: 'Create' });
  await command.up(ARGS);
  expect(migrate).not.toHaveBeenCalled();
});

it('does nothing when the standard command is absent', async () => {
  getOrRecompute.mockResolvedValue({
    flatCommandMenuItemMaps: { byUniversalIdentifier: {} },
  });
  await command.up(ARGS);
  expect(migrate).not.toHaveBeenCalled();
});

it('does not write during a dry run', async () => {
  jest.spyOn(command['logger'], 'log').mockImplementation();
  await command.up({ ...ARGS, options: { dryRun: true } });
  expect(migrate).not.toHaveBeenCalled();
});

it('restores the former labels on rollback', async () => {
  mockCommand({ label: 'Create {objectLabelSingular}', shortLabel: 'Create' });
  await command.down(ARGS);
  expect(
    migrate.mock.calls[0][0].allFlatEntityOperationByMetadataName
      .commandMenuItem.flatEntityToUpdate[0],
  ).toMatchObject(EXISTING_COMMAND);
});

it('propagates migration failures', async () => {
  migrate.mockRejectedValue(new Error('Migration failed'));
  await expect(command.up(ARGS)).rejects.toThrow('Migration failed');
});
