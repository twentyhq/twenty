import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SplitEmailBlockSettingsCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791810616035-split-email-block-settings-command-menu-item.command';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';

const EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.emailBlockSettings.universalIdentifier;
const EMAIL_PAGE_STYLE_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.emailPageStyle.universalIdentifier;

const BLOCK_SETTINGS_PRESENTATION = {
  label: 'Block Settings',
  shortLabel: 'Design',
  icon: 'IconAdjustments',
};

const ADD_BLOCK_PRESENTATION = {
  label: 'Add Block',
  shortLabel: 'Add Block',
  icon: 'IconPlus',
};

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-10-12T12:00:00.000Z',
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const STANDARD_COMMAND_MENU_ITEMS_BY_UNIVERSAL_IDENTIFIER =
  allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier;

const getStandardEmailBlockSettings = (): FlatCommandMenuItem => {
  const emailBlockSettings =
    STANDARD_COMMAND_MENU_ITEMS_BY_UNIVERSAL_IDENTIFIER[
      EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER
    ];

  if (!isDefined(emailBlockSettings)) {
    throw new Error('Standard Block Settings command menu item missing');
  }

  return emailBlockSettings;
};

describe('SplitEmailBlockSettingsCommandMenuItemCommand', () => {
  let command: SplitEmailBlockSettingsCommandMenuItemCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    getOrRecomputeMock = jest.fn();
    validateBuildAndRunLegacyWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    command = new SplitEmailBlockSettingsCommandMenuItemCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunLegacyWorkspaceMigration:
          validateBuildAndRunLegacyWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const buildArgs = (dryRun = false) => ({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
    index: 0,
    total: 1,
  });

  const mockWorkspaceCommandMenuItems = (
    byUniversalIdentifier: Partial<Record<string, FlatCommandMenuItem>>,
  ) => {
    getOrRecomputeMock.mockResolvedValue({
      flatCommandMenuItemMaps: {
        ...allFlatEntityMaps.flatCommandMenuItemMaps,
        byUniversalIdentifier,
      },
      flatObjectMetadataMaps: allFlatEntityMaps.flatObjectMetadataMaps,
    });
  };

  const mockWorkspaceBeforeSplit = (
    emailBlockSettingsPresentation: Partial<FlatCommandMenuItem> = BLOCK_SETTINGS_PRESENTATION,
  ) =>
    mockWorkspaceCommandMenuItems({
      ...STANDARD_COMMAND_MENU_ITEMS_BY_UNIVERSAL_IDENTIFIER,
      [EMAIL_PAGE_STYLE_UNIVERSAL_IDENTIFIER]: undefined,
      [EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER]: {
        ...getStandardEmailBlockSettings(),
        ...emailBlockSettingsPresentation,
      },
    });

  const mockWorkspaceAfterSplit = () =>
    mockWorkspaceCommandMenuItems(
      STANDARD_COMMAND_MENU_ITEMS_BY_UNIVERSAL_IDENTIFIER,
    );

  it('adds Email Style and renames Block Settings to Add Block', async () => {
    mockWorkspaceBeforeSplit();

    await command.runOnWorkspace(buildArgs());

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      isSystemBuild: true,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      allFlatEntityOperationByMetadataName: {
        commandMenuItem: {
          flatEntityToCreate: [
            expect.objectContaining({
              universalIdentifier: EMAIL_PAGE_STYLE_UNIVERSAL_IDENTIFIER,
            }),
          ],
          flatEntityToDelete: [],
          flatEntityToUpdate: [
            expect.objectContaining({
              universalIdentifier: EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER,
              ...ADD_BLOCK_PRESENTATION,
            }),
          ],
        },
      },
    });
  });

  it.each([
    {
      customization: { label: 'Edit blocks' },
      expectedPresentation: { ...ADD_BLOCK_PRESENTATION, label: 'Edit blocks' },
    },
    {
      customization: { shortLabel: null },
      expectedPresentation: { ...ADD_BLOCK_PRESENTATION, shortLabel: null },
    },
    {
      customization: { icon: 'IconLayoutGrid' },
      expectedPresentation: {
        ...ADD_BLOCK_PRESENTATION,
        icon: 'IconLayoutGrid',
      },
    },
  ])(
    'keeps the customized Block Settings $customization',
    async ({ customization, expectedPresentation }) => {
      mockWorkspaceBeforeSplit({
        ...BLOCK_SETTINGS_PRESENTATION,
        ...customization,
      });

      await command.runOnWorkspace(buildArgs());

      expect(
        validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0]
          .allFlatEntityOperationByMetadataName.commandMenuItem
          .flatEntityToUpdate,
      ).toEqual([expect.objectContaining(expectedPresentation)]);
    },
  );

  it('does nothing on a workspace that is already split', async () => {
    mockWorkspaceAfterSplit();

    await command.runOnWorkspace(buildArgs());

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('writes nothing on a dry run', async () => {
    mockWorkspaceBeforeSplit();

    await command.runOnWorkspace(buildArgs(true));

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('removes Email Style and restores Block Settings on down', async () => {
    mockWorkspaceAfterSplit();

    await command.down(buildArgs());

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.commandMenuItem,
    ).toEqual({
      flatEntityToCreate: [],
      flatEntityToDelete: [
        expect.objectContaining({
          universalIdentifier: EMAIL_PAGE_STYLE_UNIVERSAL_IDENTIFIER,
        }),
      ],
      flatEntityToUpdate: [
        expect.objectContaining({
          universalIdentifier: EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER,
          ...BLOCK_SETTINGS_PRESENTATION,
        }),
      ],
    });
  });
});
