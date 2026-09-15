import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddCalendarEventRelationsViewFieldCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787982276903-add-calendar-event-relations-view-field.command';
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
const VIEW_ID = '20202020-0000-0000-0000-000000000002';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const CALENDAR_EVENT_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields
    .universalIdentifier;
const RELATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields.viewFields
    .calendarEventTargets.universalIdentifier;
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

describe('AddCalendarEventRelationsViewFieldCommand', () => {
  let command: AddCalendarEventRelationsViewFieldCommand;
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
        flatViewFieldMaps: buildByUniversalIdentifierMap([
          { universalIdentifier: RELATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIER },
        ]),
      },
    });

    command = new AddCalendarEventRelationsViewFieldCommand(
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
    viewExists = true,
    targetsFieldExists = true,
    viewFields = [],
  }: {
    viewExists?: boolean;
    targetsFieldExists?: boolean;
    viewFields?: { universalIdentifier: string }[];
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
      flatViewMaps: buildByUniversalIdentifierMap(
        viewExists
          ? [
              {
                id: VIEW_ID,
                universalIdentifier:
                  CALENDAR_EVENT_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
              },
            ]
          : [],
      ),
      flatViewFieldMaps: buildByUniversalIdentifierMap(viewFields),
    });
  };

  it('creates the Relations view field', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace();

    const [payload] = validateBuildAndRunWorkspaceMigrationMock.mock.calls[0];

    expect(
      payload.allFlatEntityOperationByMetadataName.viewField.flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: RELATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    ]);
  });

  it('is idempotent when the Relations view field already exists', async () => {
    mockWorkspaceCache({
      viewFields: [
        { universalIdentifier: RELATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIER },
      ],
    });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips workspaces without a Calendar Event record page fields view', async () => {
    mockWorkspaceCache({ viewExists: false });

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
