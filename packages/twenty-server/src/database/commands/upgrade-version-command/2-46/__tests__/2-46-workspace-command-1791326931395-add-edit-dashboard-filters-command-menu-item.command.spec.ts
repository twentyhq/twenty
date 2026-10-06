import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddEditDashboardFiltersCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791326931395-add-edit-dashboard-filters-command-menu-item.command';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const APPLICATION_ID = '20202020-0000-0000-0000-0000000000aa';
const DASHBOARD_OBJECT_ID = '20202020-0000-0000-0000-0000000000dd';

const EDIT_DASHBOARD_FILTERS_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.editDashboardFilters.universalIdentifier;

const buildStandardCommandMenuItem = (universalIdentifier: string) => ({
  universalIdentifier,
  applicationId: APPLICATION_ID,
  applicationUniversalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
});

const buildFlatCommandMenuItemMaps = (universalIdentifiers: string[]) => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      buildStandardCommandMenuItem(universalIdentifier),
    ]),
  ),
});

const buildFlatObjectMetadataMaps = (hasDashboardObject: boolean) => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: hasDashboardObject
    ? {
        [STANDARD_OBJECTS.dashboard.universalIdentifier]: {
          id: DASHBOARD_OBJECT_ID,
          universalIdentifier: STANDARD_OBJECTS.dashboard.universalIdentifier,
        },
      }
    : {},
});

describe('AddEditDashboardFiltersCommandMenuItemCommand', () => {
  let command: AddEditDashboardFiltersCommandMenuItemCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    getOrRecomputeMock = jest.fn();
    validateBuildAndRunLegacyWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    command = new AddEditDashboardFiltersCommandMenuItemCommand(
      {} as WorkspaceIteratorService,
      { getOrRecompute: getOrRecomputeMock } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunLegacyWorkspaceMigration:
          validateBuildAndRunLegacyWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const mockWorkspaceCache = ({
    existingCommandMenuItemUniversalIdentifiers = [
      STANDARD_COMMAND_MENU_ITEMS.editDashboardLayout.universalIdentifier,
    ],
    hasDashboardObject = true,
  }: {
    existingCommandMenuItemUniversalIdentifiers?: string[];
    hasDashboardObject?: boolean;
  } = {}) => {
    getOrRecomputeMock.mockResolvedValue({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps(
        existingCommandMenuItemUniversalIdentifiers,
      ),
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps(hasDashboardObject),
    });
  };

  const runArgs = (dryRun = false) => ({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
    index: 0,
    total: 1,
  });

  it('adds the command when the workspace does not have it yet', async () => {
    mockWorkspaceCache();

    await command.runOnWorkspace(runArgs());

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledTimes(1);

    const { allFlatEntityOperationByMetadataName, isSystemBuild } =
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0];

    expect(isSystemBuild).toBe(true);
    expect(
      allFlatEntityOperationByMetadataName.commandMenuItem.flatEntityToDelete,
    ).toEqual([]);
    expect(
      allFlatEntityOperationByMetadataName.commandMenuItem.flatEntityToCreate,
    ).toMatchObject([
      {
        universalIdentifier: EDIT_DASHBOARD_FILTERS_UNIVERSAL_IDENTIFIER,
        applicationId: APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
        availabilityObjectMetadataId: DASHBOARD_OBJECT_ID,
        engineComponentKey: 'EDIT_DASHBOARD_FILTERS',
      },
    ]);
  });

  it('does nothing when the workspace already has the command', async () => {
    mockWorkspaceCache({
      existingCommandMenuItemUniversalIdentifiers: [
        EDIT_DASHBOARD_FILTERS_UNIVERSAL_IDENTIFIER,
      ],
    });

    await command.runOnWorkspace(runArgs());

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('skips a workspace without the dashboard object', async () => {
    mockWorkspaceCache({ hasDashboardObject: false });

    await command.runOnWorkspace(runArgs());

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('does not write metadata in dry-run mode', async () => {
    mockWorkspaceCache();

    await command.runOnWorkspace(runArgs(true));

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('removes the command on down', async () => {
    mockWorkspaceCache({
      existingCommandMenuItemUniversalIdentifiers: [
        EDIT_DASHBOARD_FILTERS_UNIVERSAL_IDENTIFIER,
      ],
    });

    await command.down(runArgs());

    const { allFlatEntityOperationByMetadataName } =
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0];

    expect(
      allFlatEntityOperationByMetadataName.commandMenuItem.flatEntityToCreate,
    ).toEqual([]);
    expect(
      allFlatEntityOperationByMetadataName.commandMenuItem.flatEntityToDelete,
    ).toEqual([
      buildStandardCommandMenuItem(
        EDIT_DASHBOARD_FILTERS_UNIVERSAL_IDENTIFIER,
      ),
    ]);
  });
});
