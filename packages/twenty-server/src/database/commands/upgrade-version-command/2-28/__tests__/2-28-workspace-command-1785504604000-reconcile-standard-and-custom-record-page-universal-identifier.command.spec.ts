import {
  getPageLayoutTabUniversalIdentifier,
  getPageLayoutWidgetUniversalIdentifier,
  getRecordPageLayoutUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  getViewFieldGroupUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ReconcileStandardAndCustomRecordPageUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785504604000-reconcile-standard-and-custom-record-page-universal-identifier.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000ad';
const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000aa';
const EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000ae';
const OBJECT_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000bb';
const FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000cc';

const DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  getRecordPageLayoutUniversalIdentifier({
    applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

const DERIVED_HOME_TAB_UNIVERSAL_IDENTIFIER =
  getPageLayoutTabUniversalIdentifier({
    applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    pageLayoutUniversalIdentifier: DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
    title: 'Home',
  });

const DERIVED_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER =
  getPageLayoutWidgetUniversalIdentifier({
    applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    pageLayoutTabUniversalIdentifier: DERIVED_HOME_TAB_UNIVERSAL_IDENTIFIER,
    title: 'Fields',
  });

const DERIVED_VIEW_UNIVERSAL_IDENTIFIER = getSystemViewUniversalIdentifier({
  objectMetadataApplicationUniversalIdentifier:
    STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  viewKey: ViewKey.FIELDS_WIDGET,
});

const DERIVED_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier:
      STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  });

const DERIVED_GENERAL_GROUP_UNIVERSAL_IDENTIFIER =
  getViewFieldGroupUniversalIdentifier({
    applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
    name: 'General',
  });

const buildByUniversalIdentifierMap = <
  T extends { universalIdentifier: string; id?: string },
>(
  flatEntities: T[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities
      .filter((flatEntity) => flatEntity.id !== undefined)
      .map((flatEntity) => [flatEntity.id, flatEntity.universalIdentifier]),
  ),
});

// An underived pre-2.28 stack: v4 identifiers everywhere, no key, groups
// authored by twenty-standard.
const UNDERIVED_VIEW: {
  id: string;
  universalIdentifier: string;
  key: ViewKey | null;
  isSystemSideEffect: boolean;
  deletedAt: string | null;
  objectMetadataUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  viewFieldUniversalIdentifiers: string[];
  viewFieldGroupUniversalIdentifiers: string[];
} = {
  id: 'view-db-id',
  universalIdentifier: 'aaaaaaaa-0000-4000-8000-000000000001',
  key: null,
  isSystemSideEffect: true,
  deletedAt: null,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  viewFieldUniversalIdentifiers: ['aaaaaaaa-0000-4000-8000-000000000002'],
  viewFieldGroupUniversalIdentifiers: ['aaaaaaaa-0000-4000-8000-000000000003'],
};

const UNDERIVED_VIEW_FIELD: {
  id: string;
  universalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  isSystemSideEffect: boolean;
  deletedAt: string | null;
} = {
  id: 'view-field-db-id',
  universalIdentifier: 'aaaaaaaa-0000-4000-8000-000000000002',
  fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  isSystemSideEffect: false,
  deletedAt: null,
};

const STANDARD_AUTHORED_GROUP = {
  id: 'view-field-group-db-id',
  universalIdentifier: 'aaaaaaaa-0000-4000-8000-000000000003',
  name: 'General',
  isSystemSideEffect: false,
  deletedAt: null,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const UNDERIVED_PAGE_LAYOUT = {
  id: 'page-layout-db-id',
  universalIdentifier: 'aaaaaaaa-0000-4000-8000-000000000004',
  type: PageLayoutType.RECORD_PAGE,
  isSystemSideEffect: true,
  deletedAt: null,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  tabUniversalIdentifiers: ['aaaaaaaa-0000-4000-8000-000000000005'],
};

const UNDERIVED_HOME_TAB = {
  id: 'tab-db-id',
  universalIdentifier: 'aaaaaaaa-0000-4000-8000-000000000005',
  title: 'Home',
  isSystemSideEffect: true,
  deletedAt: null,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  widgetUniversalIdentifiers: ['aaaaaaaa-0000-4000-8000-000000000006'],
};

const UNDERIVED_FIELDS_WIDGET = {
  id: 'widget-db-id',
  universalIdentifier: 'aaaaaaaa-0000-4000-8000-000000000006',
  title: 'Fields',
  isSystemSideEffect: true,
  deletedAt: null,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  configuration: {
    configurationType: WidgetConfigurationType.FIELDS,
    viewId: UNDERIVED_VIEW.id,
    newFieldDefaultVisibility: true,
  },
};

const OBJECT_METADATA = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const FIELD_METADATA = {
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

describe('ReconcileStandardAndCustomRecordPageUniversalIdentifierCommand', () => {
  let command: ReconcileStandardAndCustomRecordPageUniversalIdentifierCommand;
  let getOrRecomputeMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;
  let updateMocksByEntity: Map<unknown, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    invalidateCacheMock = jest.fn().mockResolvedValue(undefined);
    updateMocksByEntity = new Map(
      [
        PageLayoutEntity,
        PageLayoutTabEntity,
        PageLayoutWidgetEntity,
        ViewEntity,
        ViewFieldEntity,
        ViewFieldGroupEntity,
      ].map((entity) => [entity, jest.fn().mockResolvedValue(undefined)]),
    );

    const entityManagerMock = {
      getRepository: (entity: unknown) => {
        const updateMock = updateMocksByEntity.get(entity);

        if (updateMock === undefined) {
          throw new Error('Unexpected repository');
        }

        return { update: updateMock };
      },
    };

    const viewRepositoryMock = {
      manager: {
        transaction: jest.fn(
          async (callback: (entityManager: unknown) => Promise<void>) =>
            callback(entityManagerMock),
        ),
      },
    };

    command = new ReconcileStandardAndCustomRecordPageUniversalIdentifierCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        invalidateCache: invalidateCacheMock,
      } as unknown as WorkspaceMigrationRunnerService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: {
              universalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            },
            workspaceCustomFlatApplication: {
              universalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
            },
          }),
      } as unknown as ApplicationService,
      viewRepositoryMock as never,
    );
  });

  const mockWorkspaceCache = ({
    views = [UNDERIVED_VIEW],
    viewFields = [UNDERIVED_VIEW_FIELD],
    viewFieldGroups = [STANDARD_AUTHORED_GROUP],
    pageLayouts = [UNDERIVED_PAGE_LAYOUT],
    pageLayoutTabs = [UNDERIVED_HOME_TAB],
    pageLayoutWidgets = [UNDERIVED_FIELDS_WIDGET],
  }: {
    views?: (typeof UNDERIVED_VIEW)[];
    viewFields?: (typeof UNDERIVED_VIEW_FIELD)[];
    viewFieldGroups?: (typeof STANDARD_AUTHORED_GROUP)[];
    pageLayouts?: (typeof UNDERIVED_PAGE_LAYOUT)[];
    pageLayoutTabs?: (typeof UNDERIVED_HOME_TAB)[];
    pageLayoutWidgets?: (typeof UNDERIVED_FIELDS_WIDGET)[];
  } = {}) => {
    getOrRecomputeMock.mockResolvedValue({
      flatViewMaps: buildByUniversalIdentifierMap(views),
      flatViewFieldMaps: buildByUniversalIdentifierMap(viewFields),
      flatViewFieldGroupMaps: buildByUniversalIdentifierMap(viewFieldGroups),
      flatObjectMetadataMaps: buildByUniversalIdentifierMap([OBJECT_METADATA]),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap([FIELD_METADATA]),
      flatPageLayoutMaps: buildByUniversalIdentifierMap(pageLayouts),
      flatPageLayoutTabMaps: buildByUniversalIdentifierMap(pageLayoutTabs),
      flatPageLayoutWidgetMaps:
        buildByUniversalIdentifierMap(pageLayoutWidgets),
    });
  };

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('re-owns the full record-page stack onto the derived identifiers', async () => {
    mockWorkspaceCache();

    await runOnWorkspace();

    expect(updateMocksByEntity.get(PageLayoutEntity)).toHaveBeenCalledWith(
      { id: UNDERIVED_PAGE_LAYOUT.id, workspaceId: WORKSPACE_ID },
      { universalIdentifier: DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER },
    );
    expect(updateMocksByEntity.get(PageLayoutTabEntity)).toHaveBeenCalledWith(
      { id: UNDERIVED_HOME_TAB.id, workspaceId: WORKSPACE_ID },
      { universalIdentifier: DERIVED_HOME_TAB_UNIVERSAL_IDENTIFIER },
    );
    expect(
      updateMocksByEntity.get(PageLayoutWidgetEntity),
    ).toHaveBeenCalledWith(
      { id: UNDERIVED_FIELDS_WIDGET.id, workspaceId: WORKSPACE_ID },
      { universalIdentifier: DERIVED_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER },
    );
    expect(updateMocksByEntity.get(ViewEntity)).toHaveBeenCalledWith(
      { id: UNDERIVED_VIEW.id, workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
        key: ViewKey.FIELDS_WIDGET,
      },
    );
    expect(updateMocksByEntity.get(ViewFieldEntity)).toHaveBeenCalledWith(
      { id: UNDERIVED_VIEW_FIELD.id, workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
    expect(updateMocksByEntity.get(ViewFieldGroupEntity)).toHaveBeenCalledWith(
      { id: STANDARD_AUTHORED_GROUP.id, workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_GENERAL_GROUP_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
    expect(invalidateCacheMock).toHaveBeenCalled();
  });

  it('is idempotent: a fully derived stack yields no update', async () => {
    mockWorkspaceCache({
      views: [
        {
          ...UNDERIVED_VIEW,
          universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          key: ViewKey.FIELDS_WIDGET,
          viewFieldUniversalIdentifiers: [
            DERIVED_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          ],
          viewFieldGroupUniversalIdentifiers: [
            DERIVED_GENERAL_GROUP_UNIVERSAL_IDENTIFIER,
          ],
        },
      ],
      viewFields: [
        {
          ...UNDERIVED_VIEW_FIELD,
          universalIdentifier: DERIVED_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          isSystemSideEffect: true,
        },
      ],
      viewFieldGroups: [
        {
          ...STANDARD_AUTHORED_GROUP,
          universalIdentifier: DERIVED_GENERAL_GROUP_UNIVERSAL_IDENTIFIER,
          isSystemSideEffect: true,
        },
      ],
      pageLayouts: [
        {
          ...UNDERIVED_PAGE_LAYOUT,
          universalIdentifier: DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          tabUniversalIdentifiers: [DERIVED_HOME_TAB_UNIVERSAL_IDENTIFIER],
        },
      ],
      pageLayoutTabs: [
        {
          ...UNDERIVED_HOME_TAB,
          universalIdentifier: DERIVED_HOME_TAB_UNIVERSAL_IDENTIFIER,
          widgetUniversalIdentifiers: [
            DERIVED_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
          ],
        },
      ],
      pageLayoutWidgets: [
        {
          ...UNDERIVED_FIELDS_WIDGET,
          universalIdentifier: DERIVED_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    for (const updateMock of updateMocksByEntity.values()) {
      expect(updateMock).not.toHaveBeenCalled();
    }
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('does not touch layouts owned by other applications', async () => {
    mockWorkspaceCache({
      pageLayouts: [
        {
          ...UNDERIVED_PAGE_LAYOUT,
          applicationUniversalIdentifier:
            EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    for (const updateMock of updateMocksByEntity.values()) {
      expect(updateMock).not.toHaveBeenCalled();
    }
  });

  it('leaves app-authored tabs attached to the engine layout untouched', async () => {
    const appTab = {
      ...UNDERIVED_HOME_TAB,
      id: 'app-tab-db-id',
      universalIdentifier: 'aaaaaaaa-0000-4000-8000-000000000007',
      title: 'Transcript',
      applicationUniversalIdentifier: EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
      widgetUniversalIdentifiers: [],
    };

    mockWorkspaceCache({
      pageLayouts: [
        {
          ...UNDERIVED_PAGE_LAYOUT,
          tabUniversalIdentifiers: [
            UNDERIVED_HOME_TAB.universalIdentifier,
            appTab.universalIdentifier,
          ],
        },
      ],
      pageLayoutTabs: [UNDERIVED_HOME_TAB, appTab],
    });

    await runOnWorkspace();

    expect(updateMocksByEntity.get(PageLayoutTabEntity)).toHaveBeenCalledTimes(
      1,
    );
    expect(updateMocksByEntity.get(PageLayoutTabEntity)).toHaveBeenCalledWith(
      { id: UNDERIVED_HOME_TAB.id, workspaceId: WORKSPACE_ID },
      { universalIdentifier: DERIVED_HOME_TAB_UNIVERSAL_IDENTIFIER },
    );
  });

  it('leaves user-created view field groups untouched', async () => {
    mockWorkspaceCache({
      viewFieldGroups: [
        {
          ...STANDARD_AUTHORED_GROUP,
          applicationUniversalIdentifier:
            CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    expect(updateMocksByEntity.get(ViewFieldGroupEntity)).not.toHaveBeenCalled();
  });

  it('skips every write in dry-run mode', async () => {
    mockWorkspaceCache();

    await runOnWorkspace(true);

    for (const updateMock of updateMocksByEntity.values()) {
      expect(updateMock).not.toHaveBeenCalled();
    }
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('skips soft-deleted view fields', async () => {
    mockWorkspaceCache({
      viewFields: [
        { ...UNDERIVED_VIEW_FIELD, deletedAt: '2024-01-01T00:00:00.000Z' },
      ],
    });

    await runOnWorkspace();

    expect(updateMocksByEntity.get(ViewFieldEntity)).not.toHaveBeenCalled();
  });
});
