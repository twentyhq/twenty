import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode, ViewKey } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SyncMessageListRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788639798701-sync-message-list-record-page.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_DESKTOP,
  CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_MOBILE,
  CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
  CONDITIONAL_DISPLAY_DEVICE_MOBILE,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
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

const LIST = STANDARD_OBJECTS.messageList;
const LIST_MEMBER = STANDARD_OBJECTS.messageListMember;
const PERSON = STANDARD_OBJECTS.person;
const LIST_RECORD_PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage;

const DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER =
  LIST.fields.description.universalIdentifier;
const DESCRIPTION_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  LIST.views.allMessageLists.viewFields.description.universalIdentifier;
const LIST_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  LIST.views.allMessageLists.universalIdentifier;
const NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  LIST.views.allMessageLists.viewFields.name.universalIdentifier;
const MEMBERS_VIEW_UNIVERSAL_IDENTIFIER =
  PERSON.views.messageListRecordPageMembers.universalIdentifier;
const MEMBERS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = Object.values(
  PERSON.views.messageListRecordPageMembers.viewFields,
).map((viewField) => viewField.universalIdentifier);
const MEMBERS_VIEW_FILTER_UNIVERSAL_IDENTIFIER =
  PERSON.views.messageListRecordPageMembers.viewFilters
    .listMembershipsListIsCurrentRecord.universalIdentifier;
const MEMBERS_VIEW_ID = '20202020-0000-0000-0000-000000000010';
const OTHER_VIEW_ID = '20202020-0000-0000-0000-000000000099';

const STANDARD_MEMBERS_VIEW_FIELDS = MEMBERS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.map(
  (universalIdentifier, position) => ({
    universalIdentifier,
    viewUniversalIdentifier: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
    position,
  }),
);
const STANDARD_MEMBERS_VIEW_FILTER = {
  universalIdentifier: MEMBERS_VIEW_FILTER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
};

const HOME_TAB_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.home.universalIdentifier;
const FIELDS_WIDGET_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.home.widgets.fields.universalIdentifier;
const HOME_MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.home.widgets.members.universalIdentifier;
const MEMBERS_TAB_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.members.universalIdentifier;
const MEMBERS_TAB_WIDGET_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.members.widgets.members.universalIdentifier;

const MEMBERS_FIELD_METADATA_ID = '20202020-0000-0000-0000-000000000030';

const STANDARD_MEMBERS_TAB = {
  universalIdentifier: MEMBERS_TAB_UNIVERSAL_IDENTIFIER,
  title: 'Members',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
};

const buildTableConfiguration = (viewId?: string) => ({
  configurationType: WidgetConfigurationType.FIELD,
  fieldMetadataId: MEMBERS_FIELD_METADATA_ID,
  fieldDisplayMode: FieldDisplayMode.TABLE,
  ...(viewId ? { viewId } : {}),
});

const buildTableUniversalConfiguration = (viewId?: string) => ({
  configurationType: WidgetConfigurationType.FIELD,
  fieldMetadataId: LIST.fields.members.universalIdentifier,
  fieldDisplayMode: FieldDisplayMode.TABLE,
  ...(viewId ? { viewId } : {}),
});

const STANDARD_HOME_MEMBERS_WIDGET = {
  universalIdentifier: HOME_MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER,
  configuration: buildTableConfiguration(MEMBERS_VIEW_ID),
  universalConfiguration: buildTableUniversalConfiguration(
    MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
  ),
  conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_MOBILE,
  conditionalAvailabilityExpression:
    CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_MOBILE,
};

const STANDARD_MEMBERS_TAB_WIDGET = {
  universalIdentifier: MEMBERS_TAB_WIDGET_UNIVERSAL_IDENTIFIER,
  configuration: buildTableConfiguration(MEMBERS_VIEW_ID),
  universalConfiguration: buildTableUniversalConfiguration(
    MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
  ),
  conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
  conditionalAvailabilityExpression:
    CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_DESKTOP,
};

const buildMaps = <TEntity extends { universalIdentifier: string }>(
  entities: TEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

const buildHomeTab = () => ({
  id: '20202020-0000-0000-0000-000000000020',
  universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
  applicationId: STANDARD_APPLICATION.id,
  overrides: null,
  isActive: true,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
});

const buildMembersTab = (overrides: Record<string, unknown> = {}) => ({
  id: '20202020-0000-0000-0000-000000000023',
  universalIdentifier: MEMBERS_TAB_UNIVERSAL_IDENTIFIER,
  applicationId: STANDARD_APPLICATION.id,
  overrides: null,
  isActive: true,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  ...overrides,
});

const buildFieldsWidget = () => ({
  id: '20202020-0000-0000-0000-000000000021',
  universalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
  applicationId: STANDARD_APPLICATION.id,
  overrides: null,
  isActive: true,
  configuration: { configurationType: WidgetConfigurationType.FIELDS },
  universalConfiguration: {
    configurationType: WidgetConfigurationType.FIELDS,
  },
});

const buildHomeMembersWidget = (overrides: Record<string, unknown> = {}) => ({
  id: '20202020-0000-0000-0000-000000000022',
  universalIdentifier: HOME_MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER,
  applicationId: STANDARD_APPLICATION.id,
  overrides: null,
  isActive: true,
  conditionalDisplay: null,
  conditionalAvailabilityExpression: null,
  configuration: {
    configurationType: WidgetConfigurationType.FIELD,
    fieldMetadataId: MEMBERS_FIELD_METADATA_ID,
    fieldDisplayMode: FieldDisplayMode.CARD,
  },
  universalConfiguration: {
    configurationType: WidgetConfigurationType.FIELD,
    fieldMetadataId: LIST.fields.members.universalIdentifier,
    fieldDisplayMode: FieldDisplayMode.CARD,
  },
  ...overrides,
});

const buildMembersTabWidget = (overrides: Record<string, unknown> = {}) => ({
  id: '20202020-0000-0000-0000-000000000024',
  universalIdentifier: MEMBERS_TAB_WIDGET_UNIVERSAL_IDENTIFIER,
  applicationId: STANDARD_APPLICATION.id,
  overrides: null,
  isActive: true,
  conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
  conditionalAvailabilityExpression:
    CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_DESKTOP,
  configuration: buildTableConfiguration(MEMBERS_VIEW_ID),
  universalConfiguration: buildTableUniversalConfiguration(
    MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
  ),
  ...overrides,
});

const EXISTING_MEMBERS_METADATA = {
  existingFieldUniversalIdentifiers: [DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER],
  existingViews: [
    {
      id: MEMBERS_VIEW_ID,
      universalIdentifier: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
    },
  ],
  existingViewFields: [
    ...STANDARD_MEMBERS_VIEW_FIELDS,
    {
      universalIdentifier: DESCRIPTION_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
    },
  ],
  existingViewFilters: [MEMBERS_VIEW_FILTER_UNIVERSAL_IDENTIFIER],
};

describe('SyncMessageListRecordPageCommand', () => {
  let command: SyncMessageListRecordPageCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    validateBuildAndRunLegacyWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    computeTwentyStandardApplicationAllFlatEntityMapsMock.mockReturnValue({
      allFlatEntityMaps: {
        flatFieldMetadataMaps: buildMaps([
          { universalIdentifier: DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewMaps: buildMaps([
          {
            id: MEMBERS_VIEW_ID,
            universalIdentifier: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
          },
        ]),
        flatViewFieldMaps: buildMaps([
          ...STANDARD_MEMBERS_VIEW_FIELDS,
          {
            universalIdentifier: DESCRIPTION_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
            viewUniversalIdentifier: LIST_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
            position: 1,
          },
        ]),
        flatViewFilterMaps: buildMaps([STANDARD_MEMBERS_VIEW_FILTER]),
        flatPageLayoutTabMaps: buildMaps([STANDARD_MEMBERS_TAB]),
        flatPageLayoutWidgetMaps: buildMaps([
          STANDARD_HOME_MEMBERS_WIDGET,
          STANDARD_MEMBERS_TAB_WIDGET,
        ]),
      },
    } as unknown as ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >);

    command = new SyncMessageListRecordPageCommand(
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
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  const mockWorkspaceCache = ({
    hasListObjects = true,
    existingFieldUniversalIdentifiers = [] as string[],
    existingViews = [] as {
      id: string;
      universalIdentifier: string;
      deletedAt?: string;
    }[],
    existingViewFields = [] as {
      universalIdentifier: string;
      position: number;
      deletedAt?: string;
    }[],
    existingViewFilters = [] as string[],
    tabs = [buildHomeTab()] as Record<string, unknown>[],
    widgets = [buildFieldsWidget(), buildHomeMembersWidget()] as Record<
      string,
      unknown
    >[],
  } = {}) => {
    const listIndexView = {
      id: '20202020-0000-0000-0000-000000000011',
      universalIdentifier: LIST_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
      key: ViewKey.INDEX,
      deletedAt: null,
      viewFieldUniversalIdentifiers: existingViewFields.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    };

    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: buildMaps(
        hasListObjects
          ? [
              {
                universalIdentifier: LIST.universalIdentifier,
                viewUniversalIdentifiers: [LIST_INDEX_VIEW_UNIVERSAL_IDENTIFIER],
              },
              { universalIdentifier: LIST_MEMBER.universalIdentifier },
            ]
          : [],
      ),
      flatFieldMetadataMaps: buildMaps(
        existingFieldUniversalIdentifiers.map((universalIdentifier) => ({
          universalIdentifier,
        })),
      ),
      flatViewMaps: buildMaps([listIndexView, ...existingViews]),
      flatViewFieldMaps: buildMaps(existingViewFields),
      flatViewFilterMaps: buildMaps(
        existingViewFilters.map((universalIdentifier) => ({
          universalIdentifier,
        })),
      ),
      flatPageLayoutTabMaps: buildMaps(
        tabs as { universalIdentifier: string }[],
      ),
      flatPageLayoutWidgetMaps: buildMaps(
        widgets as { universalIdentifier: string }[],
      ),
    });
  };

  const getMigrationPayload = () =>
    validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0]
      .allFlatEntityOperationByMetadataName;

  const expectHomeMembersWidgetAlignedWithStandard = (
    widgetUpdate: unknown,
    viewId = MEMBERS_VIEW_ID,
  ) =>
    expect(widgetUpdate).toEqual(
      expect.objectContaining({
        universalIdentifier: HOME_MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER,
        configuration: expect.objectContaining({
          fieldDisplayMode: FieldDisplayMode.TABLE,
          viewId,
        }),
        universalConfiguration: expect.objectContaining({
          fieldDisplayMode: FieldDisplayMode.TABLE,
          viewId: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
        }),
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_MOBILE,
        conditionalAvailabilityExpression:
          CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_MOBILE,
      }),
    );

  it('creates the metadata and the members tab, and turns the home members widget into a mobile table', async () => {
    mockWorkspaceCache({
      existingViewFields: [
        { universalIdentifier: NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER, position: 0 },
        { universalIdentifier: 'other-column', position: 3 },
        {
          universalIdentifier: 'removed-column',
          position: 9,
          deletedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.fieldMetadata.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    ]);
    expect(payload.view.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
      }),
    ]);
    expect(payload.viewField.flatEntityToCreate).toEqual([
      ...STANDARD_MEMBERS_VIEW_FIELDS,
      expect.objectContaining({
        universalIdentifier: DESCRIPTION_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: LIST_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
        position: 4,
      }),
    ]);
    expect(payload.viewFilter.flatEntityToCreate).toEqual([
      STANDARD_MEMBERS_VIEW_FILTER,
    ]);
    expect(payload.pageLayoutTab.flatEntityToCreate).toEqual([
      STANDARD_MEMBERS_TAB,
    ]);
    expect(payload.pageLayoutTab.flatEntityToUpdate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toEqual([
      STANDARD_MEMBERS_TAB_WIDGET,
    ]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate).toHaveLength(1);
    expectHomeMembersWidgetAlignedWithStandard(
      payload.pageLayoutWidget.flatEntityToUpdate[0],
    );
  });

  it('embeds the existing members view when it was already created', async () => {
    mockWorkspaceCache({
      ...EXISTING_MEMBERS_METADATA,
      existingViews: [
        {
          id: OTHER_VIEW_ID,
          universalIdentifier: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.fieldMetadata.flatEntityToCreate).toEqual([]);
    expect(payload.view.flatEntityToCreate).toEqual([]);
    expect(payload.viewField.flatEntityToCreate).toEqual([]);
    expect(payload.viewFilter.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutTab.flatEntityToCreate).toEqual([
      STANDARD_MEMBERS_TAB,
    ]);
    expectHomeMembersWidgetAlignedWithStandard(
      payload.pageLayoutWidget.flatEntityToUpdate[0],
      OTHER_VIEW_ID,
    );
  });

  it('attaches the view to a members tab provisioned before the view existed', async () => {
    mockWorkspaceCache({
      tabs: [buildHomeTab(), buildMembersTab()],
      widgets: [
        buildFieldsWidget(),
        buildHomeMembersWidget({
          conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_MOBILE,
          conditionalAvailabilityExpression:
            CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_MOBILE,
          configuration: buildTableConfiguration(),
          universalConfiguration: buildTableUniversalConfiguration(),
        }),
        buildMembersTabWidget({
          configuration: buildTableConfiguration(),
          universalConfiguration: buildTableUniversalConfiguration(),
        }),
      ],
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.pageLayoutTab.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate).toEqual([
      expect.objectContaining({
        universalIdentifier: HOME_MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER,
        configuration: buildTableConfiguration(MEMBERS_VIEW_ID),
        universalConfiguration: buildTableUniversalConfiguration(
          MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
        ),
      }),
      expect.objectContaining({
        universalIdentifier: MEMBERS_TAB_WIDGET_UNIVERSAL_IDENTIFIER,
        configuration: buildTableConfiguration(MEMBERS_VIEW_ID),
        universalConfiguration: buildTableUniversalConfiguration(
          MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
        ),
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
      }),
    ]);
  });

  it('leaves a customized members widget untouched but still adds the metadata and the tab', async () => {
    mockWorkspaceCache({
      widgets: [
        buildFieldsWidget(),
        buildHomeMembersWidget({ overrides: { title: 'People' } }),
      ],
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.fieldMetadata.flatEntityToCreate).toHaveLength(1);
    expect(payload.pageLayoutTab.flatEntityToCreate).toEqual([
      STANDARD_MEMBERS_TAB,
    ]);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toEqual([
      STANDARD_MEMBERS_TAB_WIDGET,
    ]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate).toEqual([]);
  });

  it('leaves a soft-deleted members widget untouched', async () => {
    mockWorkspaceCache({
      ...EXISTING_MEMBERS_METADATA,
      tabs: [buildHomeTab(), buildMembersTab()],
      widgets: [
        buildFieldsWidget(),
        buildHomeMembersWidget({ deletedAt: '2026-01-01T00:00:00.000Z' }),
        buildMembersTabWidget(),
      ],
    });

    await runOnWorkspace();

    expect(validateBuildAndRunLegacyWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('leaves a widget embedding another view untouched', async () => {
    mockWorkspaceCache({
      ...EXISTING_MEMBERS_METADATA,
      tabs: [buildHomeTab(), buildMembersTab()],
      widgets: [
        buildFieldsWidget(),
        buildHomeMembersWidget({
          configuration: buildTableConfiguration(OTHER_VIEW_ID),
          universalConfiguration: buildTableUniversalConfiguration(
            OTHER_VIEW_ID,
          ),
        }),
        buildMembersTabWidget(),
      ],
    });

    await runOnWorkspace();

    expect(validateBuildAndRunLegacyWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('does not embed or refill a soft-deleted members view', async () => {
    mockWorkspaceCache({
      existingViews: [
        {
          id: MEMBERS_VIEW_ID,
          universalIdentifier: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
          deletedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.fieldMetadata.flatEntityToCreate).toHaveLength(1);
    expect(payload.view.flatEntityToCreate).toEqual([]);
    expect(payload.viewFilter.flatEntityToCreate).toEqual([]);
    expect(payload.viewField.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: DESCRIPTION_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    ]);
    expect(payload.pageLayoutTab.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate).toEqual([]);
  });

  it('does not recreate a soft-deleted members tab', async () => {
    mockWorkspaceCache({
      ...EXISTING_MEMBERS_METADATA,
      tabs: [
        buildHomeTab(),
        buildMembersTab({ deletedAt: '2026-01-01T00:00:00.000Z' }),
      ],
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.pageLayoutTab.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate).toHaveLength(1);
    expectHomeMembersWidgetAlignedWithStandard(
      payload.pageLayoutWidget.flatEntityToUpdate[0],
    );
  });

  it('does not recreate a soft-deleted description column', async () => {
    mockWorkspaceCache({
      existingViewFields: [
        {
          universalIdentifier: DESCRIPTION_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          position: 1,
          deletedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(
      payload.viewField.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual(MEMBERS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS);
  });

  it('adds the metadata but no layout when the list record page does not exist', async () => {
    mockWorkspaceCache({ tabs: [], widgets: [] });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.fieldMetadata.flatEntityToCreate).toHaveLength(1);
    expect(payload.view.flatEntityToCreate).toHaveLength(1);
    expect(payload.pageLayoutTab.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate).toEqual([]);
  });

  it('does nothing when everything is already in place', async () => {
    mockWorkspaceCache({
      ...EXISTING_MEMBERS_METADATA,
      tabs: [buildHomeTab(), buildMembersTab()],
      widgets: [
        buildFieldsWidget(),
        buildHomeMembersWidget({
          conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_MOBILE,
          conditionalAvailabilityExpression:
            CONDITIONAL_AVAILABILITY_EXPRESSION_DEVICE_MOBILE,
          configuration: buildTableConfiguration(MEMBERS_VIEW_ID),
          universalConfiguration: buildTableUniversalConfiguration(
            MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
          ),
        }),
        buildMembersTabWidget(),
      ],
    });

    await runOnWorkspace();

    expect(validateBuildAndRunLegacyWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('does not write metadata in dry-run mode', async () => {
    mockWorkspaceCache();

    await runOnWorkspace(true);

    expect(validateBuildAndRunLegacyWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips workspaces without the message list objects', async () => {
    mockWorkspaceCache({ hasListObjects: false });

    await runOnWorkspace();

    expect(validateBuildAndRunLegacyWorkspaceMigrationMock).not.toHaveBeenCalled();
  });
});
