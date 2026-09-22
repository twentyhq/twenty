import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddSeeRecordInViewCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790070801000-add-see-record-in-view-command.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

describe('AddSeeRecordInViewCommand', () => {
  const migrate = jest.fn();
  const getOrRecompute = jest.fn();
  const getApplication = jest.fn();
  let command: AddSeeRecordInViewCommand;

  beforeEach(() => {
    jest.clearAllMocks();
    migrate.mockResolvedValue({ status: 'success' });
    getOrRecompute.mockResolvedValue({
      flatCommandMenuItemMaps: { byUniversalIdentifier: {} },
      flatObjectMetadataMaps: { byUniversalIdentifier: {} },
    });
    getApplication.mockResolvedValue({
      twentyStandardFlatApplication: {
        id: 'application-id',
        universalIdentifier: 'application-universal-identifier',
      },
    });
    command = new AddSeeRecordInViewCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: getApplication,
      } as unknown as ApplicationService,
      { getOrRecompute } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunLegacyWorkspaceMigration: migrate,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
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

  it('adds only the missing command without changing existing metadata', async () => {
    await run();

    expect(migrate).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        allFlatEntityOperationByMetadataName: {
          commandMenuItem: {
            flatEntityToCreate: [
              expect.objectContaining({
                universalIdentifier:
                  STANDARD_COMMAND_MENU_ITEMS.seeRecordInView.universalIdentifier,
                engineComponentKey: 'SEE_RECORD_IN_VIEW',
                workspaceId: WORKSPACE_ID,
                isActive: true,
              }),
            ],
            flatEntityToUpdate: [],
            flatEntityToDelete: [],
          },
        },
      }),
    );
  });

  it('preserves an already registered command on subsequent runs', async () => {
    getOrRecompute.mockResolvedValue({
      flatCommandMenuItemMaps: {
        byUniversalIdentifier: {
          [STANDARD_COMMAND_MENU_ITEMS.seeRecordInView.universalIdentifier]: {
            label: 'Customized label',
          },
        },
      },
      flatObjectMetadataMaps: { byUniversalIdentifier: {} },
    });

    await run();

    expect(migrate).not.toHaveBeenCalled();
    expect(getApplication).not.toHaveBeenCalled();
  });

  it('does not write in dry run mode', async () => {
    await run(true);

    expect(migrate).not.toHaveBeenCalled();
  });

  it('fails visibly when the migration is rejected', async () => {
    migrate.mockResolvedValue({ status: 'fail' });

    await expect(run()).rejects.toThrow('Failed to add See in view command');
  });
});
