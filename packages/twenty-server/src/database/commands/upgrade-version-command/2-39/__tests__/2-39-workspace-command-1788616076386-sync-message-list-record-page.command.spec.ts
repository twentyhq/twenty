import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode, ViewKey } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SyncMessageListRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788616076386-sync-message-list-record-page.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { MESSAGE_LIST_GRID_LAYOUT_POSITIONS } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-message-list-page-layout.config';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
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
const OTHER_APPLICATION_ID = '20202020-0000-0000-0000-0000000000cc';

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
const MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.home.widgets.members.universalIdentifier;

const buildMaps = <TEntity extends { universalIdentifier: string }>(
  entities: TEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

const buildHomeTab = (overrides: Record<string, unknown> = {}) => ({
  id: '20202020-0000-0000-0000-000000000020',
  universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
  applicationId: STANDARD_APPLICATION.id,
  overrides: null,
  isActive: true,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgetUniversalIdentifiers: [
    FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
    MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER,
  ],
  ...overrides,
});

const buildFieldsWidget = () => ({
  id: '20202020-0000-0000-0000-000000000021',
  universalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
  applicationId: STANDARD_APPLICATION.id,
  overrides: null,
  isActive: true,
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
  configuration: { configurationType: WidgetConfigurationType.FIELDS },
  universalConfiguration: {
    configurationType: WidgetConfigurationType.FIELDS,
  },
});

const buildMembersWidget = (overrides: Record<string, unknown> = {}) => ({
  id: '20202020-0000-0000-0000-000000000022',
  universalIdentifier: MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER,
  applicationId: STANDARD_APPLICATION.id,
  overrides: null,
  isActive: true,
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 1 },
  configuration: {
    configurationType: WidgetConfigurationType.FIELD,
    fieldMetadataId: '20202020-0000-0000-0000-000000000030',
    fieldDisplayMode: FieldDisplayMode.CARD,
  },
  universalConfiguration: {
    configurationType: WidgetConfigurationType.FIELD,
    fieldMetadataId: LIST.fields.members.universalIdentifier,
    fieldDisplayMode: FieldDisplayMode.CARD,
  },
  ...overrides,
});

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
    homeTab = buildHomeTab() as ReturnType<typeof buildHomeTab> | undefined,
    membersWidget = buildMembersWidget(),
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
      flatPageLayoutTabMaps: buildMaps(homeTab ? [homeTab] : []),
      flatPageLayoutWidgetMaps: buildMaps([
        buildFieldsWidget(),
        membersWidget,
      ]),
    });
  };

  const getMigrationPayload = () =>
    validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0]
      .allFlatEntityOperationByMetadataName;

  it('creates the description field, the members view and moves the layout to the grid', async () => {
    mockWorkspaceCache({
      existingViewFields: [
        { universalIdentifier: NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER, position: 0 },
        { universalIdentifier: 'other-column', position: 3 },
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
    expect(payload.pageLayoutTab.flatEntityToUpdate).toEqual([
      expect.objectContaining({
        universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
        layoutMode: PageLayoutTabLayoutMode.GRID,
      }),
    ]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate).toEqual([
      expect.objectContaining({
        universalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
        position: MESSAGE_LIST_GRID_LAYOUT_POSITIONS.LEFT_COLUMN,
      }),
      expect.objectContaining({
        universalIdentifier: MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER,
        position: MESSAGE_LIST_GRID_LAYOUT_POSITIONS.RIGHT_COLUMN,
        configuration: expect.objectContaining({
          fieldDisplayMode: FieldDisplayMode.TABLE,
          viewId: MEMBERS_VIEW_ID,
        }),
        universalConfiguration: expect.objectContaining({
          fieldDisplayMode: FieldDisplayMode.TABLE,
          viewId: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
        }),
      }),
    ]);
  });

  it('embeds the existing members view when it was already created', async () => {
    const existingMembersViewId = '20202020-0000-0000-0000-000000000099';

    mockWorkspaceCache({
      existingFieldUniversalIdentifiers: [DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER],
      existingViews: [
        {
          id: existingMembersViewId,
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
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.fieldMetadata.flatEntityToCreate).toEqual([]);
    expect(payload.view.flatEntityToCreate).toEqual([]);
    expect(payload.viewField.flatEntityToCreate).toEqual([]);
    expect(payload.viewFilter.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate[1]).toEqual(
      expect.objectContaining({
        configuration: expect.objectContaining({
          viewId: existingMembersViewId,
        }),
      }),
    );
  });

  it('leaves a customized layout untouched but still adds the metadata', async () => {
    mockWorkspaceCache({
      homeTab: buildHomeTab({ applicationId: OTHER_APPLICATION_ID }),
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.fieldMetadata.flatEntityToCreate).toHaveLength(1);
    expect(payload.pageLayoutTab.flatEntityToUpdate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate).toEqual([]);
  });

  it('leaves a tab that is no longer a vertical list untouched', async () => {
    mockWorkspaceCache({
      homeTab: buildHomeTab({ layoutMode: PageLayoutTabLayoutMode.CANVAS }),
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.pageLayoutTab.flatEntityToUpdate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate).toEqual([]);
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
    expect(payload.pageLayoutTab.flatEntityToUpdate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate).toEqual([]);
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

  it('does nothing when everything is already in place', async () => {
    mockWorkspaceCache({
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
      homeTab: buildHomeTab({ layoutMode: PageLayoutTabLayoutMode.GRID }),
      membersWidget: buildMembersWidget({
        configuration: {
          configurationType: WidgetConfigurationType.FIELD,
          fieldMetadataId: '20202020-0000-0000-0000-000000000030',
          fieldDisplayMode: FieldDisplayMode.TABLE,
          viewId: MEMBERS_VIEW_ID,
        },
      }),
    });

    await runOnWorkspace();

    expect(validateBuildAndRunLegacyWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('embeds the members view in a grid table widget provisioned before the view existed', async () => {
    mockWorkspaceCache({
      homeTab: buildHomeTab({ layoutMode: PageLayoutTabLayoutMode.GRID }),
      membersWidget: buildMembersWidget({
        position: MESSAGE_LIST_GRID_LAYOUT_POSITIONS.RIGHT_COLUMN,
        configuration: {
          configurationType: WidgetConfigurationType.FIELD,
          fieldMetadataId: '20202020-0000-0000-0000-000000000030',
          fieldDisplayMode: FieldDisplayMode.TABLE,
        },
      }),
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.view.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
      }),
    ]);
    // The tab already sits on the grid, only the widget gets its view.
    expect(payload.pageLayoutTab.flatEntityToUpdate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToUpdate).toEqual([
      expect.objectContaining({
        universalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
      }),
      expect.objectContaining({
        universalIdentifier: MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER,
        configuration: expect.objectContaining({
          fieldDisplayMode: FieldDisplayMode.TABLE,
          viewId: MEMBERS_VIEW_ID,
        }),
      }),
    ]);
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
