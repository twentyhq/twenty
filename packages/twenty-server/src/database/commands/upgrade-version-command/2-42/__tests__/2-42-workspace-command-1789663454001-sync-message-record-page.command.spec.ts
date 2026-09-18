import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SyncMessageRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789652804002-sync-message-record-page.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant',
);

const computeTwentyStandardApplicationAllFlatEntityMapsMock = jest.mocked(
  computeTwentyStandardApplicationAllFlatEntityMaps,
);

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const MESSAGE = STANDARD_OBJECTS.message;
const MESSAGE_RECORD_PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageRecordPage;

const FIELDS_VIEW_UNIVERSAL_IDENTIFIER =
  MESSAGE.views.messageRecordPageFields.universalIdentifier;
const FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS = Object.values(
  MESSAGE.views.messageRecordPageFields.viewFieldGroups,
).map((viewFieldGroup) => viewFieldGroup.universalIdentifier);
const FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = Object.values(
  MESSAGE.views.messageRecordPageFields.viewFields,
).map((viewField) => viewField.universalIdentifier);

const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  MESSAGE_RECORD_PAGE.universalIdentifier;
const HOME_TAB_UNIVERSAL_IDENTIFIER =
  MESSAGE_RECORD_PAGE.tabs.home.universalIdentifier;
const FIELDS_WIDGET_UNIVERSAL_IDENTIFIER =
  MESSAGE_RECORD_PAGE.tabs.home.widgets.fields.universalIdentifier;

const STANDARD_FIELDS_VIEW_ID = '20202020-0000-0000-0000-000000000010';
const EXISTING_FIELDS_VIEW_ID = '20202020-0000-0000-0000-000000000011';

const buildMaps = <TEntity extends { universalIdentifier: string }>(
  entities: TEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

const buildStandardFieldsWidget = () => ({
  universalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
  pageLayoutTabUniversalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
  configuration: {
    configurationType: WidgetConfigurationType.FIELDS,
    viewId: STANDARD_FIELDS_VIEW_ID,
    newFieldDefaultVisibility: true,
  },
  universalConfiguration: {
    configurationType: WidgetConfigurationType.FIELDS,
    viewUniversalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
    newFieldDefaultVisibility: true,
  },
});

describe('SyncMessageRecordPageCommand', () => {
  let command: SyncMessageRecordPageCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigrationMock: jest.Mock;
  let loggerLogMock: jest.SpyInstance;
  let loggerWarnMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    validateBuildAndRunLegacyWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    computeTwentyStandardApplicationAllFlatEntityMapsMock.mockReturnValue({
      allFlatEntityMaps: {
        flatViewMaps: buildMaps([
          {
            id: STANDARD_FIELDS_VIEW_ID,
            universalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
          },
        ]),
        flatViewFieldGroupMaps: buildMaps(
          FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS.map(
            (universalIdentifier) => ({ universalIdentifier }),
          ),
        ),
        flatViewFieldMaps: buildMaps(
          FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.map(
            (universalIdentifier) => ({ universalIdentifier }),
          ),
        ),
        flatPageLayoutMaps: buildMaps([
          { universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER },
        ]),
        flatPageLayoutTabMaps: buildMaps([
          { universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER },
        ]),
        flatPageLayoutWidgetMaps: buildMaps([buildStandardFieldsWidget()]),
      },
    } as unknown as ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >);

    command = new SyncMessageRecordPageCommand(
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
    loggerWarnMock = jest.spyOn(command['logger'], 'warn').mockImplementation();
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  const mockWorkspaceCache = ({
    hasMessageObject = true,
    existingViews = [] as {
      id: string;
      universalIdentifier: string;
      deletedAt?: string;
    }[],
    existingViewFieldGroups = [] as string[],
    existingViewFields = [] as string[],
    existingPageLayouts = [] as {
      universalIdentifier: string;
      deletedAt?: string;
    }[],
    existingPageLayoutTabs = [] as {
      universalIdentifier: string;
      deletedAt?: string;
    }[],
    existingPageLayoutWidgets = [] as string[],
  } = {}) => {
    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: buildMaps(
        hasMessageObject
          ? [{ universalIdentifier: MESSAGE.universalIdentifier }]
          : [],
      ),
      flatViewMaps: buildMaps(existingViews),
      flatViewFieldGroupMaps: buildMaps(
        existingViewFieldGroups.map((universalIdentifier) => ({
          universalIdentifier,
        })),
      ),
      flatViewFieldMaps: buildMaps(
        existingViewFields.map((universalIdentifier) => ({
          universalIdentifier,
        })),
      ),
      flatPageLayoutMaps: buildMaps(existingPageLayouts),
      flatPageLayoutTabMaps: buildMaps(existingPageLayoutTabs),
      flatPageLayoutWidgetMaps: buildMaps(
        existingPageLayoutWidgets.map((universalIdentifier) => ({
          universalIdentifier,
        })),
      ),
    });
  };

  const getMigrationPayload = () =>
    validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0]
      .allFlatEntityOperationByMetadataName;

  it('creates the whole record page on a workspace that has none of it', async () => {
    mockWorkspaceCache();

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.view.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
      }),
    ]);
    expect(
      payload.viewFieldGroup.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual(FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS);
    expect(
      payload.viewField.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual(FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS);
    expect(payload.pageLayout.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
      }),
    ]);
    expect(payload.pageLayoutTab.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
      }),
    ]);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
      }),
    ]);
  });

  it('never deletes or updates anything', async () => {
    mockWorkspaceCache();

    await runOnWorkspace();

    for (const operation of Object.values(getMigrationPayload())) {
      expect(operation).toMatchObject({
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      });
    }
  });

  it('binds the fields widget to the fields view the workspace already holds', async () => {
    mockWorkspaceCache({
      existingViews: [
        {
          id: EXISTING_FIELDS_VIEW_ID,
          universalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
        },
      ],
      existingViewFieldGroups: FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS,
      existingViewFields: FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.view.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
        configuration: expect.objectContaining({
          viewId: EXISTING_FIELDS_VIEW_ID,
        }),
      }),
    ]);
  });

  it('creates only what a partially provisioned workspace is missing', async () => {
    mockWorkspaceCache({
      existingViews: [
        {
          id: EXISTING_FIELDS_VIEW_ID,
          universalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
        },
      ],
      existingViewFieldGroups: FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS,
      existingViewFields: FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
      existingPageLayouts: [
        { universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER },
      ],
      existingPageLayoutTabs: [
        { universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER },
      ],
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.view.flatEntityToCreate).toEqual([]);
    expect(payload.viewFieldGroup.flatEntityToCreate).toEqual([]);
    expect(payload.viewField.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayout.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutTab.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
      }),
    ]);
  });

  it('is a no-op on a workspace that already has the record page', async () => {
    mockWorkspaceCache({
      existingViews: [
        {
          id: EXISTING_FIELDS_VIEW_ID,
          universalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
        },
      ],
      existingViewFieldGroups: FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS,
      existingViewFields: FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
      existingPageLayouts: [
        { universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER },
      ],
      existingPageLayoutTabs: [
        { universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER },
      ],
      existingPageLayoutWidgets: [FIELDS_WIDGET_UNIVERSAL_IDENTIFIER],
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('skips a workspace without the message object', async () => {
    mockWorkspaceCache({ hasMessageObject: false });

    await runOnWorkspace();

    expect(
      computeTwentyStandardApplicationAllFlatEntityMapsMock,
    ).not.toHaveBeenCalled();
    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  // A widget pointing at a soft-deleted view renders nothing, which is the very
  // blank page this command exists to fix.
  it('leaves the record page untouched when the fields view was soft deleted', async () => {
    mockWorkspaceCache({
      existingViews: [
        {
          id: EXISTING_FIELDS_VIEW_ID,
          universalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
          deletedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    await runOnWorkspace();

    expect(loggerWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('was deleted'),
    );
    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  // getStandardFlatEntitiesToCreateOrThrow counts a soft-deleted row as
  // present, so without an explicit guard the command would create a tab and a
  // widget hanging off a deleted parent.
  it('leaves the record page untouched when the layout itself was soft deleted', async () => {
    mockWorkspaceCache({
      existingPageLayouts: [
        {
          universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          deletedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    await runOnWorkspace();

    expect(loggerWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('record page layout was deleted'),
    );
    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('leaves the record page untouched when the home tab was soft deleted', async () => {
    mockWorkspaceCache({
      existingPageLayouts: [
        { universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER },
      ],
      existingPageLayoutTabs: [
        {
          universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
          deletedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    await runOnWorkspace();

    expect(loggerWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('home tab was deleted'),
    );
    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('reports what it would do on a dry run without running the migration', async () => {
    mockWorkspaceCache();

    await runOnWorkspace(true);

    expect(loggerLogMock).toHaveBeenCalledWith(
      expect.stringContaining('[DRY RUN]'),
    );
    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('throws when the migration fails, so the upgrade does not record success', async () => {
    const failedResult = { status: 'fail' };

    mockWorkspaceCache();
    validateBuildAndRunLegacyWorkspaceMigrationMock.mockResolvedValue(
      failedResult,
    );

    await expect(runOnWorkspace()).rejects.toThrow(
      `Failed to sync the message record page for workspace ${WORKSPACE_ID}`,
    );
    // the typed exception is what carries the failed build result to callers
    await expect(runOnWorkspace()).rejects.toMatchObject({
      name: 'WorkspaceMigrationBuilderException',
      failedWorkspaceMigrationBuildResult: failedResult,
    });
  });
});
