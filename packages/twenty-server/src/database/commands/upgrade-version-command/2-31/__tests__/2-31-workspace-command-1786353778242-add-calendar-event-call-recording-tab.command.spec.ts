import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddCalendarEventCallRecordingTabCommand } from 'src/database/commands/upgrade-version-command/2-31/2-31-workspace-command-1786353778242-add-calendar-event-call-recording-tab.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant',
);

const computeTwentyStandardApplicationAllFlatEntityMapsMock =
  computeTwentyStandardApplicationAllFlatEntityMaps as jest.Mock;

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const PAGE_LAYOUT_ID = '20202020-0000-0000-0000-000000000002';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const CALENDAR_EVENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage
    .universalIdentifier;
const HOME_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs.home
    .universalIdentifier;
const TIMELINE_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
    .timeline.universalIdentifier;
const CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
    .callRecording.universalIdentifier;
const TRANSCRIPT_WIDGET_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
    .callRecording.widgets.transcript.universalIdentifier;

const buildByUniversalIdentifierMap = <
  T extends { universalIdentifier: string },
>(flatEntities: T[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
});

const buildPageLayoutTab = ({
  universalIdentifier,
  position,
  isActive = true,
  deletedAt = null,
}: {
  universalIdentifier: string;
  position: number;
  isActive?: boolean;
  deletedAt?: string | null;
}) => ({
  universalIdentifier,
  pageLayoutId: PAGE_LAYOUT_ID,
  position,
  isActive,
  deletedAt,
});

describe('AddCalendarEventCallRecordingTabCommand', () => {
  let command: AddCalendarEventCallRecordingTabCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    validateBuildAndRunWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    computeTwentyStandardApplicationAllFlatEntityMapsMock.mockReturnValue({
      allFlatEntityMaps: {
        flatPageLayoutTabMaps: buildByUniversalIdentifierMap([
          {
            universalIdentifier: CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER,
            position: 30,
          },
        ]),
        flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap([
          {
            universalIdentifier: TRANSCRIPT_WIDGET_UNIVERSAL_IDENTIFIER,
          },
        ]),
      },
    });

    command = new AddCalendarEventCallRecordingTabCommand(
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
    pageLayoutExists = true,
    tabs = [],
    widgets = [],
  }: {
    pageLayoutExists?: boolean;
    tabs?: ReturnType<typeof buildPageLayoutTab>[];
    widgets?: { universalIdentifier: string }[];
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatPageLayoutMaps: buildByUniversalIdentifierMap(
        pageLayoutExists
          ? [
              {
                id: PAGE_LAYOUT_ID,
                universalIdentifier:
                  CALENDAR_EVENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
              },
            ]
          : [],
      ),
      flatPageLayoutTabMaps: buildByUniversalIdentifierMap(tabs),
      flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap(widgets),
    });
  };

  it('passes the computed tab position to the migration', async () => {
    mockWorkspaceCache({
      tabs: [
        buildPageLayoutTab({
          universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
          position: 10,
        }),
        buildPageLayoutTab({
          universalIdentifier: TIMELINE_TAB_UNIVERSAL_IDENTIFIER,
          position: 20,
        }),
      ],
    });

    await runOnWorkspace();

    const [payload] = validateBuildAndRunWorkspaceMigrationMock.mock.calls[0];

    expect(
      payload.allFlatEntityOperationByMetadataName.pageLayoutTab
        .flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER,
        position: 15,
      }),
    ]);
    expect(
      payload.allFlatEntityOperationByMetadataName.pageLayoutWidget
        .flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: TRANSCRIPT_WIDGET_UNIVERSAL_IDENTIFIER,
      }),
    ]);
  });

  it('is idempotent when the tab and transcript already exist', async () => {
    mockWorkspaceCache({
      tabs: [
        buildPageLayoutTab({
          universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
          position: 10,
        }),
        buildPageLayoutTab({
          universalIdentifier: CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER,
          position: 30,
        }),
      ],
      widgets: [
        { universalIdentifier: TRANSCRIPT_WIDGET_UNIVERSAL_IDENTIFIER },
      ],
    });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('creates only the missing transcript widget without moving an existing tab', async () => {
    mockWorkspaceCache({
      tabs: [
        buildPageLayoutTab({
          universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
          position: 10,
        }),
        buildPageLayoutTab({
          universalIdentifier: CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER,
          position: 73,
        }),
      ],
    });

    await runOnWorkspace();

    const [payload] = validateBuildAndRunWorkspaceMigrationMock.mock.calls[0];

    expect(
      payload.allFlatEntityOperationByMetadataName.pageLayoutTab
        .flatEntityToCreate,
    ).toEqual([]);
    expect(
      payload.allFlatEntityOperationByMetadataName.pageLayoutWidget
        .flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: TRANSCRIPT_WIDGET_UNIVERSAL_IDENTIFIER,
      }),
    ]);
  });

  it('does not write metadata in dry-run mode', async () => {
    mockWorkspaceCache({
      tabs: [
        buildPageLayoutTab({
          universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
          position: 10,
        }),
      ],
    });

    await runOnWorkspace(true);

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips workspaces without a Calendar Event page layout', async () => {
    mockWorkspaceCache({ pageLayoutExists: false });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });
});
