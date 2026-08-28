import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SurfaceTargetRelationsOnRecordPagesCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787926797984-surface-target-relations-on-record-pages.command';
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
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const MESSAGE_THREAD_TARGETS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageThread.fields.messageThreadTargets
    .universalIdentifier;
const CALENDAR_EVENT_TARGETS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.calendarEvent.fields.calendarEventTargets
    .universalIdentifier;

const MESSAGE_THREAD_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageThread.views.messageThreadRecordPageFields
    .universalIdentifier;
const MESSAGE_THREAD_GENERAL_GROUP_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageThread.views.messageThreadRecordPageFields
    .viewFieldGroups.general.universalIdentifier;
const MESSAGE_THREAD_TARGETS_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageThread.views.messageThreadRecordPageFields.viewFields
    .messageThreadTargets.universalIdentifier;

const CALENDAR_EVENT_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields
    .universalIdentifier;
const CALENDAR_EVENT_TARGETS_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields.viewFields
    .calendarEventTargets.universalIdentifier;

const MESSAGE_THREAD_HOME_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageThreadRecordPage.tabs.home
    .universalIdentifier;
const MESSAGE_THREAD_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageThreadRecordPage.tabs.home
    .widgets.fields.universalIdentifier;

const buildByUniversalIdentifierMap = <
  TFlatEntity extends { universalIdentifier: string },
>(
  flatEntities: TFlatEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
});

const buildWorkspaceMaps = ({
  hasTargetFields = true,
  hasCalendarEventRecordPageView = true,
  hasMessageThreadHomeTab = true,
  existingUniversalIdentifiers = [] as string[],
} = {}) => ({
  flatFieldMetadataMaps: buildByUniversalIdentifierMap(
    hasTargetFields
      ? [
          {
            universalIdentifier:
              MESSAGE_THREAD_TARGETS_FIELD_UNIVERSAL_IDENTIFIER,
          },
          {
            universalIdentifier:
              CALENDAR_EVENT_TARGETS_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ]
      : [],
  ),
  flatViewMaps: buildByUniversalIdentifierMap([
    ...(hasCalendarEventRecordPageView
      ? [{ universalIdentifier: CALENDAR_EVENT_VIEW_UNIVERSAL_IDENTIFIER }]
      : []),
    ...(existingUniversalIdentifiers.includes(
      MESSAGE_THREAD_VIEW_UNIVERSAL_IDENTIFIER,
    )
      ? [{ universalIdentifier: MESSAGE_THREAD_VIEW_UNIVERSAL_IDENTIFIER }]
      : []),
  ]),
  flatViewFieldMaps: buildByUniversalIdentifierMap(
    existingUniversalIdentifiers
      .filter((universalIdentifier) =>
        [
          MESSAGE_THREAD_TARGETS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          CALENDAR_EVENT_TARGETS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        ].includes(universalIdentifier),
      )
      .map((universalIdentifier) => ({ universalIdentifier })),
  ),
  flatViewFieldGroupMaps: buildByUniversalIdentifierMap(
    existingUniversalIdentifiers.includes(
      MESSAGE_THREAD_GENERAL_GROUP_UNIVERSAL_IDENTIFIER,
    )
      ? [
          {
            universalIdentifier:
              MESSAGE_THREAD_GENERAL_GROUP_UNIVERSAL_IDENTIFIER,
          },
        ]
      : [],
  ),
  flatPageLayoutTabMaps: buildByUniversalIdentifierMap(
    hasMessageThreadHomeTab
      ? [{ universalIdentifier: MESSAGE_THREAD_HOME_TAB_UNIVERSAL_IDENTIFIER }]
      : [],
  ),
  flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap(
    existingUniversalIdentifiers.includes(
      MESSAGE_THREAD_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
    )
      ? [
          {
            universalIdentifier:
              MESSAGE_THREAD_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
          },
        ]
      : [],
  ),
});

describe('SurfaceTargetRelationsOnRecordPagesCommand', () => {
  let command: SurfaceTargetRelationsOnRecordPagesCommand;
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
        flatViewMaps: buildByUniversalIdentifierMap([
          { universalIdentifier: MESSAGE_THREAD_VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildByUniversalIdentifierMap([
          {
            universalIdentifier:
              MESSAGE_THREAD_GENERAL_GROUP_UNIVERSAL_IDENTIFIER,
          },
        ]),
        flatViewFieldMaps: buildByUniversalIdentifierMap([
          {
            universalIdentifier:
              MESSAGE_THREAD_TARGETS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          },
          {
            universalIdentifier:
              CALENDAR_EVENT_TARGETS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ]),
        flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap([
          {
            universalIdentifier:
              MESSAGE_THREAD_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
          },
        ]),
      },
    });

    command = new SurfaceTargetRelationsOnRecordPagesCommand(
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
        validateBuildAndRunWorkspaceMigration:
          validateBuildAndRunWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
    } as Parameters<typeof command.runOnWorkspace>[0]);

  it('creates the view, group, view fields and widget when none exist', async () => {
    getOrRecomputeMock.mockResolvedValue(buildWorkspaceMaps());

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledTimes(1);

    const { allFlatEntityOperationByMetadataName } =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0];

    expect(
      allFlatEntityOperationByMetadataName.view.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual([MESSAGE_THREAD_VIEW_UNIVERSAL_IDENTIFIER]);
    expect(
      allFlatEntityOperationByMetadataName.viewFieldGroup.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual([MESSAGE_THREAD_GENERAL_GROUP_UNIVERSAL_IDENTIFIER]);
    expect(
      allFlatEntityOperationByMetadataName.viewField.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual([
      MESSAGE_THREAD_TARGETS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
      CALENDAR_EVENT_TARGETS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
    ]);
    expect(
      allFlatEntityOperationByMetadataName.pageLayoutWidget.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual([MESSAGE_THREAD_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER]);
  });

  it('skips entirely when the target relation fields are missing', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildWorkspaceMaps({ hasTargetFields: false }),
    );

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips the calendar event view field when the record page view is missing', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildWorkspaceMaps({ hasCalendarEventRecordPageView: false }),
    );

    await runOnWorkspace();

    const { allFlatEntityOperationByMetadataName } =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0];

    expect(
      allFlatEntityOperationByMetadataName.viewField.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual([MESSAGE_THREAD_TARGETS_VIEW_FIELD_UNIVERSAL_IDENTIFIER]);
  });

  it('skips the widget when the message thread home tab is missing', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildWorkspaceMaps({ hasMessageThreadHomeTab: false }),
    );

    await runOnWorkspace();

    const { allFlatEntityOperationByMetadataName } =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0];

    expect(
      allFlatEntityOperationByMetadataName.pageLayoutWidget.flatEntityToCreate,
    ).toEqual([]);
  });

  it('does not run a migration when everything already exists', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildWorkspaceMaps({
        existingUniversalIdentifiers: [
          MESSAGE_THREAD_VIEW_UNIVERSAL_IDENTIFIER,
          MESSAGE_THREAD_GENERAL_GROUP_UNIVERSAL_IDENTIFIER,
          MESSAGE_THREAD_TARGETS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          CALENDAR_EVENT_TARGETS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          MESSAGE_THREAD_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
        ],
      }),
    );

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('does not run a migration on dry run', async () => {
    getOrRecomputeMock.mockResolvedValue(buildWorkspaceMaps());

    await runOnWorkspace(true);

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });
});
