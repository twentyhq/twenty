import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SimplifyStandardTaskNoteLayoutsCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788299312343-simplify-standard-task-note-layouts.command';
import {
  computeStandardTaskNoteLayoutMigrationOperations,
  type StandardTaskNoteLayoutMigrationOperations,
} from 'src/database/commands/upgrade-version-command/2-38/utils/compute-standard-task-note-layout-migration-operations.util';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

jest.mock(
  'src/database/commands/upgrade-version-command/2-38/utils/compute-standard-task-note-layout-migration-operations.util',
);

const computeOperationsMock =
  computeStandardTaskNoteLayoutMigrationOperations as jest.Mock;

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};
const MIGRATION_OPERATIONS = {
  pageLayoutTabsToDelete: [{ universalIdentifier: 'tab' }],
  skippedLayouts: [],
  viewFieldGroupsToDelete: [{ universalIdentifier: 'group' }],
  viewFieldsToDelete: [{ universalIdentifier: 'field' }],
} as unknown as StandardTaskNoteLayoutMigrationOperations;

describe('SimplifyStandardTaskNoteLayoutsCommand', () => {
  let command: SimplifyStandardTaskNoteLayoutsCommand;
  let validateBuildAndRunWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    computeOperationsMock.mockReturnValue(MIGRATION_OPERATIONS);
    validateBuildAndRunWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    command = new SimplifyStandardTaskNoteLayoutsCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: STANDARD_APPLICATION,
          }),
      } as unknown as ApplicationService,
      {
        getOrRecompute: jest.fn().mockResolvedValue({}),
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunLegacyWorkspaceMigration:
          validateBuildAndRunWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('runs the computed operations through the workspace migration service', async () => {
    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        allFlatEntityOperationByMetadataName: {
          pageLayoutTab: {
            flatEntityToCreate: [],
            flatEntityToDelete: MIGRATION_OPERATIONS.pageLayoutTabsToDelete,
            flatEntityToUpdate: [],
          },
          viewField: {
            flatEntityToCreate: [],
            flatEntityToDelete: MIGRATION_OPERATIONS.viewFieldsToDelete,
            flatEntityToUpdate: [],
          },
          viewFieldGroup: {
            flatEntityToCreate: [],
            flatEntityToDelete: MIGRATION_OPERATIONS.viewFieldGroupsToDelete,
            flatEntityToUpdate: [],
          },
        },
      }),
    );
  });

  it('does not write metadata in dry-run mode', async () => {
    await runOnWorkspace(true);

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('throws a workspace migration builder exception when the migration fails', async () => {
    validateBuildAndRunWorkspaceMigrationMock.mockResolvedValue({
      status: 'fail',
    });

    await expect(runOnWorkspace()).rejects.toBeInstanceOf(
      WorkspaceMigrationBuilderException,
    );
  });
});
