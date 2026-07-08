import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddCallRecordingCalendarEventWidgetCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783528000000-add-call-recording-calendar-event-widget.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant',
);

const computeTwentyStandardApplicationAllFlatEntityMapsMock =
  computeTwentyStandardApplicationAllFlatEntityMaps as jest.Mock;

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const CALL_RECORDING = STANDARD_OBJECTS.callRecording;
const CALL_RECORDING_PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage;

const CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER =
  CALL_RECORDING.fields.calendarEvent.universalIdentifier;
const CALENDAR_EVENT_FIELD_ID = '20202020-0000-0000-0000-0000000000ff';
const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER = CALL_RECORDING_PAGE.universalIdentifier;
const HOME_TAB_UNIVERSAL_IDENTIFIER =
  CALL_RECORDING_PAGE.tabs.home.universalIdentifier;
const CALENDAR_EVENT_WIDGET_UNIVERSAL_IDENTIFIER =
  CALL_RECORDING_PAGE.tabs.home.widgets.calendarEvent.universalIdentifier;

const buildByUniversalIdentifierMap = (
  entities: { universalIdentifier: string; [key: string]: unknown }[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

const asIdentifiers = (universalIdentifiers: string[]) =>
  universalIdentifiers.map((universalIdentifier) => ({ universalIdentifier }));

describe('AddCallRecordingCalendarEventWidgetCommand', () => {
  let command: AddCallRecordingCalendarEventWidgetCommand;
  let findApplicationMock: jest.Mock;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    findApplicationMock = jest.fn().mockResolvedValue({
      twentyStandardFlatApplication: STANDARD_APPLICATION,
    });
    getOrRecomputeMock = jest.fn();
    validateBuildAndRunWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    computeTwentyStandardApplicationAllFlatEntityMapsMock.mockReturnValue({
      allFlatEntityMaps: {
        flatPageLayoutMaps: buildByUniversalIdentifierMap(
          asIdentifiers([PAGE_LAYOUT_UNIVERSAL_IDENTIFIER]),
        ),
        flatPageLayoutTabMaps: buildByUniversalIdentifierMap(
          asIdentifiers([HOME_TAB_UNIVERSAL_IDENTIFIER]),
        ),
        flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap(
          asIdentifiers([CALENDAR_EVENT_WIDGET_UNIVERSAL_IDENTIFIER]),
        ),
      },
    });

    command = new AddCallRecordingCalendarEventWidgetCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
          findApplicationMock,
      } as unknown as ApplicationService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunWorkspaceMigration:
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

  const mockWorkspaceCache = ({
    hasObject = true,
    hasField = true,
    existingPageLayouts = [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER],
    existingTabs = [HOME_TAB_UNIVERSAL_IDENTIFIER],
    existingWidgets = [] as { universalIdentifier: string; [k: string]: unknown }[],
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: buildByUniversalIdentifierMap(
        hasObject ? asIdentifiers([CALL_RECORDING.universalIdentifier]) : [],
      ),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap(
        hasField
          ? [
              {
                universalIdentifier: CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
                id: CALENDAR_EVENT_FIELD_ID,
              },
            ]
          : [],
      ),
      flatPageLayoutMaps: buildByUniversalIdentifierMap(
        asIdentifiers(existingPageLayouts),
      ),
      flatPageLayoutTabMaps: buildByUniversalIdentifierMap(
        asIdentifiers(existingTabs),
      ),
      flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap(existingWidgets),
    });
  };

  it('creates the calendarEvent widget when it is missing', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace();

    const payload =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName;

    expect(payload.pageLayoutWidget.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: CALENDAR_EVENT_WIDGET_UNIVERSAL_IDENTIFIER,
      }),
    ]);
    expect(payload.pageLayout.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutTab.flatEntityToCreate).toEqual([]);
  });

  it('also creates the page layout and home tab when they are missing', async () => {
    mockWorkspaceCache({ existingPageLayouts: [], existingTabs: [] });

    await runOnWorkspace();

    const payload =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName;

    expect(payload.pageLayout.flatEntityToCreate).toHaveLength(1);
    expect(payload.pageLayoutTab.flatEntityToCreate).toHaveLength(1);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toHaveLength(1);
  });

  it('skips when a calendarEvent field widget was already added manually', async () => {
    mockWorkspaceCache({
      existingWidgets: [
        {
          universalIdentifier: '20202020-0000-0000-0000-0000000000ee',
          configuration: {
            configurationType: WidgetConfigurationType.FIELD,
            fieldMetadataId: CALENDAR_EVENT_FIELD_ID,
          },
        },
      ],
    });

    await runOnWorkspace();

    expect(findApplicationMock).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('does not skip for an unrelated field widget on the same object', async () => {
    mockWorkspaceCache({
      existingWidgets: [
        {
          universalIdentifier: '20202020-0000-0000-0000-0000000000ec',
          configuration: {
            configurationType: WidgetConfigurationType.FIELD,
            fieldMetadataId: '20202020-0000-0000-0000-0000000000cc',
          },
        },
      ],
    });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalled();
  });

  it('does not write metadata in dry-run mode', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace(true);

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips workspaces where the callRecording object is absent', async () => {
    mockWorkspaceCache({ hasObject: false });

    await runOnWorkspace();

    expect(findApplicationMock).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips workspaces where the calendarEvent field is absent', async () => {
    mockWorkspaceCache({ hasField: false });

    await runOnWorkspace();

    expect(findApplicationMock).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });
});
