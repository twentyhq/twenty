import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddCalendarEventRelationsWidgetCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787936377021-add-calendar-event-relations-widget.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
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
const RELATIONS_WIDGET_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs.home
    .widgets.relations.universalIdentifier;
const CALENDAR_EVENT_TARGETS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.calendarEvent.fields.calendarEventTargets
    .universalIdentifier;

const buildByUniversalIdentifierMap = <
  T extends { universalIdentifier: string },
>(
  flatEntities: T[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
});

describe('AddCalendarEventRelationsWidgetCommand', () => {
  let command: AddCalendarEventRelationsWidgetCommand;
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
        flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap([
          { universalIdentifier: RELATIONS_WIDGET_UNIVERSAL_IDENTIFIER },
        ]),
      },
    });

    command = new AddCalendarEventRelationsWidgetCommand(
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
    targetsFieldExists = true,
    widgets = [],
  }: {
    pageLayoutExists?: boolean;
    targetsFieldExists?: boolean;
    widgets?: { universalIdentifier: string }[];
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatFieldMetadataMaps: buildByUniversalIdentifierMap(
        targetsFieldExists
          ? [
              {
                universalIdentifier:
                  CALENDAR_EVENT_TARGETS_FIELD_UNIVERSAL_IDENTIFIER,
              },
            ]
          : [],
      ),
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
      flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap(widgets),
    });
  };

  it('creates the Relations widget', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace();

    const [payload] = validateBuildAndRunWorkspaceMigrationMock.mock.calls[0];

    expect(
      payload.allFlatEntityOperationByMetadataName.pageLayoutWidget
        .flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: RELATIONS_WIDGET_UNIVERSAL_IDENTIFIER,
      }),
    ]);
  });

  it('is idempotent when the Relations widget already exists', async () => {
    mockWorkspaceCache({
      widgets: [{ universalIdentifier: RELATIONS_WIDGET_UNIVERSAL_IDENTIFIER }],
    });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips workspaces without a Calendar Event page layout', async () => {
    mockWorkspaceCache({ pageLayoutExists: false });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips workspaces where calendarEventTargets does not exist yet', async () => {
    mockWorkspaceCache({ targetsFieldExists: false });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('throws a workspace migration builder exception when the migration fails', async () => {
    mockWorkspaceCache({});
    validateBuildAndRunWorkspaceMigrationMock.mockResolvedValue({
      status: 'fail',
    });

    await expect(runOnWorkspace()).rejects.toBeInstanceOf(
      WorkspaceMigrationBuilderException,
    );
  });

  it('does not write metadata in dry-run mode', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace(true);

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });
});
