import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SetMessageTextDisplayedMaxRowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789757500001-set-message-text-displayed-max-rows.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const TEXT_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.message.fields.text.universalIdentifier;
const TEXT_FIELD_ID = '20202020-0000-0000-0000-000000000010';

const DISPLAYED_MAX_ROWS = 99;

describe('SetMessageTextDisplayedMaxRowsCommand', () => {
  let command: SetMessageTextDisplayedMaxRowsCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigrationMock: jest.Mock;
  let loggerLogMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    validateBuildAndRunLegacyWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    command = new SetMessageTextDisplayedMaxRowsCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: STANDARD_APPLICATION,
          }),
      } as unknown as ApplicationService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunLegacyWorkspaceMigration:
          validateBuildAndRunLegacyWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );

    loggerLogMock = jest.spyOn(command['logger'], 'log').mockImplementation();
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  const mockWorkspaceCache = (
    textField: {
      id: string;
      universalIdentifier: string;
      settings?: Record<string, unknown>;
      universalSettings?: Record<string, unknown>;
    } | null = {
      id: TEXT_FIELD_ID,
      universalIdentifier: TEXT_FIELD_UNIVERSAL_IDENTIFIER,
    },
  ) => {
    getOrRecomputeMock.mockResolvedValue({
      flatFieldMetadataMaps: {
        byUniversalIdentifier: textField
          ? { [textField.universalIdentifier]: textField }
          : {},
      },
    });
  };

  const getUpdatedField = () =>
    validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0]
      .allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToUpdate[0];

  it('sets displayedMaxRows on the message text field', async () => {
    mockWorkspaceCache();

    await runOnWorkspace();

    expect(validateBuildAndRunLegacyWorkspaceMigrationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier:
          STANDARD_APPLICATION.universalIdentifier,
      }),
    );
    expect(getUpdatedField()).toMatchObject({
      id: TEXT_FIELD_ID,
      settings: { displayedMaxRows: DISPLAYED_MAX_ROWS },
      // the runner writes the settings column from universalSettings, and the
      // builder only diffs universal properties, so settings alone changes
      // nothing
      universalSettings: { displayedMaxRows: DISPLAYED_MAX_ROWS },
    });
  });

  it('keeps the other text settings a workspace already has', async () => {
    mockWorkspaceCache({
      id: TEXT_FIELD_ID,
      universalIdentifier: TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      settings: { displayedMaxRows: 1, someOtherSetting: 'kept' },
    });

    await runOnWorkspace();

    expect(getUpdatedField().settings).toEqual({
      displayedMaxRows: DISPLAYED_MAX_ROWS,
      someOtherSetting: 'kept',
    });
    expect(getUpdatedField().universalSettings).toEqual({
      displayedMaxRows: DISPLAYED_MAX_ROWS,
      someOtherSetting: 'kept',
    });
  });

  it('creates and deletes nothing', async () => {
    mockWorkspaceCache();

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.fieldMetadata,
    ).toMatchObject({ flatEntityToCreate: [], flatEntityToDelete: [] });
  });

  it('is a no-op when the setting is already applied', async () => {
    mockWorkspaceCache({
      id: TEXT_FIELD_ID,
      universalIdentifier: TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      settings: { displayedMaxRows: DISPLAYED_MAX_ROWS },
      universalSettings: { displayedMaxRows: DISPLAYED_MAX_ROWS },
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
    expect(loggerLogMock).toHaveBeenCalledWith(
      expect.stringContaining('already set'),
    );
  });

  // a workspace whose settings column was written without universalSettings
  // still renders one line on the next build, so it is not done yet
  it('still runs when only the settings column carries the value', async () => {
    mockWorkspaceCache({
      id: TEXT_FIELD_ID,
      universalIdentifier: TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      settings: { displayedMaxRows: DISPLAYED_MAX_ROWS },
    });

    await runOnWorkspace();

    expect(getUpdatedField().universalSettings).toEqual({
      displayedMaxRows: DISPLAYED_MAX_ROWS,
    });
  });

  it('skips a workspace without the message text field', async () => {
    mockWorkspaceCache(null);

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
    expect(loggerLogMock).toHaveBeenCalledWith(
      expect.stringContaining('not found'),
    );
  });

  it('does not run the migration on a dry run', async () => {
    mockWorkspaceCache();

    await runOnWorkspace(true);

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
    expect(loggerLogMock).toHaveBeenCalledWith(
      expect.stringContaining('[DRY RUN]'),
    );
  });

  it('throws the typed migration exception when the migration fails', async () => {
    mockWorkspaceCache();
    validateBuildAndRunLegacyWorkspaceMigrationMock.mockResolvedValue({
      status: 'fail',
    });

    await expect(runOnWorkspace()).rejects.toThrow(
      WorkspaceMigrationBuilderException,
    );
    await expect(runOnWorkspace()).rejects.toThrow(
      `Failed to set displayedMaxRows on message.text for workspace ${WORKSPACE_ID}`,
    );
  });
});
