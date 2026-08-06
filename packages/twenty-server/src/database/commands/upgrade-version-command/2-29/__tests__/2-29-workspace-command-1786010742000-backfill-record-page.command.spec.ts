import {
  getSystemRecordPageLayoutUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';
import { FieldMetadataType, ViewKey, ViewType } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-29/2-29-workspace-command-1786010742000-backfill-record-page.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant',
  () => ({
    computeTwentyStandardApplicationAllFlatEntityMaps: jest.fn(),
  }),
);

const computeStandardMapsMock =
  computeTwentyStandardApplicationAllFlatEntityMaps as jest.Mock;

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000ad';
const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000aa';
const EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000ae';
const OBJECT_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000bb';
const LABEL_FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000cc';
const OTHER_FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000cd';

const DERIVED_VIEW_UNIVERSAL_IDENTIFIER = getSystemViewUniversalIdentifier({
  objectMetadataApplicationUniversalIdentifier:
    EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  viewKey: ViewKey.FIELDS_WIDGET,
});

const STANDARD_DERIVED_VIEW_UNIVERSAL_IDENTIFIER =
  getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    viewKey: ViewKey.FIELDS_WIDGET,
  });

const STANDARD_DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  getSystemRecordPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

// An external application object with a label identifier and one other field.
const OBJECT_METADATA = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier:
    LABEL_FIELD_UNIVERSAL_IDENTIFIER,
  fieldUniversalIdentifiers: [
    LABEL_FIELD_UNIVERSAL_IDENTIFIER,
    OTHER_FIELD_UNIVERSAL_IDENTIFIER,
  ],
  labelSingular: 'Listing',
  isRemote: false,
};

const LABEL_FIELD_METADATA = {
  universalIdentifier: LABEL_FIELD_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'name',
  type: FieldMetadataType.TEXT,
};

const OTHER_FIELD_METADATA = {
  universalIdentifier: OTHER_FIELD_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'price',
  type: FieldMetadataType.NUMBER,
};

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

const isDefinedOperations = (
  args: {
    allFlatEntityOperationByMetadataName: Record<
      string,
      { flatEntityToCreate: unknown[] } | undefined
    >;
  },
  metadataName: string,
) =>
  (args.allFlatEntityOperationByMetadataName[metadataName]?.flatEntityToCreate
    .length ?? 0) > 0;

const buildStandardMaps = ({
  views = [] as { universalIdentifier: string }[],
  viewFields = [] as { universalIdentifier: string }[],
  viewFieldGroups = [] as { universalIdentifier: string }[],
  pageLayouts = [] as { universalIdentifier: string }[],
  pageLayoutTabs = [] as { universalIdentifier: string }[],
  pageLayoutWidgets = [] as { universalIdentifier: string }[],
} = {}) => ({
  allFlatEntityMaps: {
    flatViewMaps: buildByUniversalIdentifierMap(views),
    flatViewFieldMaps: buildByUniversalIdentifierMap(viewFields),
    flatViewFieldGroupMaps: buildByUniversalIdentifierMap(viewFieldGroups),
    flatPageLayoutMaps: buildByUniversalIdentifierMap(pageLayouts),
    flatPageLayoutTabMaps: buildByUniversalIdentifierMap(pageLayoutTabs),
    flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap(pageLayoutWidgets),
  },
});

describe('BackfillRecordPageCommand', () => {
  let command: BackfillRecordPageCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    computeStandardMapsMock.mockReturnValue(buildStandardMaps());

    getOrRecomputeMock = jest.fn();
    validateBuildAndRunLegacyWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    command = new BackfillRecordPageCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: {
              id: '20202020-0000-4000-8000-00000000ad1d',
              universalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            },
            workspaceCustomFlatApplication: {
              universalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
            },
          }),
      } as unknown as ApplicationService,
      {
        validateBuildAndRunLegacyWorkspaceMigration:
          validateBuildAndRunLegacyWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const mockWorkspaceCache = ({
    objectMetadatas = [OBJECT_METADATA],
    views = [] as {
      universalIdentifier: string;
      type: ViewType;
      deletedAt?: string | null;
      objectMetadataUniversalIdentifier: string;
    }[],
    viewFields = [] as { universalIdentifier: string }[],
    viewFieldGroups = [] as { universalIdentifier: string }[],
    pageLayouts = [] as {
      universalIdentifier: string;
      type: PageLayoutType;
      deletedAt?: string | null;
      objectMetadataUniversalIdentifier: string | null;
    }[],
    fieldMetadatas = [LABEL_FIELD_METADATA, OTHER_FIELD_METADATA],
  } = {}) => {
    getOrRecomputeMock.mockResolvedValue({
      flatViewMaps: buildByUniversalIdentifierMap(
        views.map((view) => ({ deletedAt: null, ...view })),
      ),
      flatViewFieldMaps: buildByUniversalIdentifierMap(viewFields),
      flatViewFieldGroupMaps: buildByUniversalIdentifierMap(viewFieldGroups),
      flatObjectMetadataMaps: buildByUniversalIdentifierMap(objectMetadatas),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap(fieldMetadatas),
      flatPageLayoutMaps: buildByUniversalIdentifierMap(
        pageLayouts.map((pageLayout) => ({ deletedAt: null, ...pageLayout })),
      ),
    });
  };

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('backfills the full record-page stack for an application object without one', async () => {
    mockWorkspaceCache();

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledTimes(2);

    const [viewRun, restRun] =
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls.map(
        ([args]) => args,
      );

    expect(viewRun.applicationUniversalIdentifier).toBe(
      EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
    );
    const [createdView] =
      viewRun.allFlatEntityOperationByMetadataName.view.flatEntityToCreate;

    expect(createdView).toMatchObject({
      universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
      key: ViewKey.FIELDS_WIDGET,
      type: ViewType.FIELDS_WIDGET,
      isSystemSideEffect: true,
    });

    const {
      viewField: viewFieldOperations,
      pageLayout: pageLayoutOperations,
      pageLayoutTab: pageLayoutTabOperations,
      pageLayoutWidget: pageLayoutWidgetOperations,
    } = restRun.allFlatEntityOperationByMetadataName;

    // The label identifier is excluded from the record page.
    expect(viewFieldOperations.flatEntityToCreate).toHaveLength(1);
    expect(viewFieldOperations.flatEntityToCreate[0]).toMatchObject({
      fieldMetadataUniversalIdentifier: OTHER_FIELD_UNIVERSAL_IDENTIFIER,
      viewUniversalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
      isSystemSideEffect: true,
    });
    expect(pageLayoutOperations.flatEntityToCreate).toHaveLength(1);
    expect(pageLayoutTabOperations.flatEntityToCreate).toHaveLength(5);
    expect(pageLayoutWidgetOperations.flatEntityToCreate).toHaveLength(5);
  });

  // Caller-defined custom record pages coexist with the system stack: the
  // backfill still provisions the system one.
  it('still backfills the system stack when the object carries a caller-authored record-page stack', async () => {
    mockWorkspaceCache({
      views: [
        {
          universalIdentifier: 'app-authored-view-uid',
          type: ViewType.FIELDS_WIDGET,
          objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        },
      ],
      pageLayouts: [
        {
          universalIdentifier: 'app-authored-layout-uid',
          type: PageLayoutType.RECORD_PAGE,
          objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledTimes(2);

    const [viewRun] =
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls.map(
        ([args]) => args,
      );
    const [createdView] =
      viewRun.allFlatEntityOperationByMetadataName.view.flatEntityToCreate;

    expect(createdView.universalIdentifier).toBe(
      DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
    );
  });

  it('backfills the engine default stack for a workspace-custom object without one', async () => {
    mockWorkspaceCache({
      objectMetadatas: [
        {
          ...OBJECT_METADATA,
          applicationUniversalIdentifier:
            CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      ],
      fieldMetadatas: [
        {
          ...LABEL_FIELD_METADATA,
          applicationUniversalIdentifier:
            CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
        {
          ...OTHER_FIELD_METADATA,
          applicationUniversalIdentifier:
            CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledTimes(2);

    const [viewRun] =
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls.map(
        ([args]) => args,
      );

    expect(viewRun.applicationUniversalIdentifier).toBe(
      CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    );
  });

  it('backfills the curated standard stack for a standard object without one', async () => {
    const curatedViewFieldUniversalIdentifier =
      getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: STANDARD_DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifier: OTHER_FIELD_UNIVERSAL_IDENTIFIER,
      });

    computeStandardMapsMock.mockReturnValue(
      buildStandardMaps({
        views: [
          {
            universalIdentifier: STANDARD_DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          },
        ],
        viewFields: [
          {
            universalIdentifier: curatedViewFieldUniversalIdentifier,
            viewUniversalIdentifier: STANDARD_DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: OTHER_FIELD_UNIVERSAL_IDENTIFIER,
          } as never,
        ],
        viewFieldGroups: [
          {
            universalIdentifier: 'standard-group-uid',
            viewUniversalIdentifier: STANDARD_DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          } as never,
        ],
        pageLayouts: [
          {
            universalIdentifier:
              STANDARD_DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          },
        ],
        pageLayoutTabs: [
          {
            universalIdentifier: 'standard-tab-uid',
            pageLayoutUniversalIdentifier:
              STANDARD_DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          } as never,
        ],
        pageLayoutWidgets: [
          {
            universalIdentifier: 'standard-widget-uid',
            pageLayoutTabUniversalIdentifier: 'standard-tab-uid',
            universalConfiguration: {
              configurationType: WidgetConfigurationType.FIELDS,
            },
          } as never,
          {
            universalIdentifier: 'standard-orphan-field-widget-uid',
            pageLayoutTabUniversalIdentifier: 'standard-tab-uid',
            universalConfiguration: {
              configurationType: WidgetConfigurationType.FIELD,
              fieldMetadataId: 'missing-field-uid',
            },
          } as never,
        ],
      }),
    );

    mockWorkspaceCache({
      objectMetadatas: [
        {
          ...OBJECT_METADATA,
          applicationUniversalIdentifier:
            STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      ],
      fieldMetadatas: [
        {
          ...LABEL_FIELD_METADATA,
          applicationUniversalIdentifier:
            STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
        {
          ...OTHER_FIELD_METADATA,
          applicationUniversalIdentifier:
            STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledTimes(2);

    const [viewRun, restRun] =
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls.map(
        ([args]) => args,
      );

    expect(viewRun.applicationUniversalIdentifier).toBe(
      STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    );
    expect(
      viewRun.allFlatEntityOperationByMetadataName.view.flatEntityToCreate[0]
        .universalIdentifier,
    ).toBe(STANDARD_DERIVED_VIEW_UNIVERSAL_IDENTIFIER);

    const {
      viewField: viewFieldOperations,
      viewFieldGroup: viewFieldGroupOperations,
      pageLayout: pageLayoutOperations,
      pageLayoutTab: pageLayoutTabOperations,
      pageLayoutWidget: pageLayoutWidgetOperations,
    } = restRun.allFlatEntityOperationByMetadataName;

    // The curated view field covers the only displayable non-label field, so
    // the generated top-up adds nothing on top of it.
    expect(viewFieldOperations.flatEntityToCreate).toHaveLength(1);
    expect(viewFieldOperations.flatEntityToCreate[0].universalIdentifier).toBe(
      curatedViewFieldUniversalIdentifier,
    );
    expect(viewFieldGroupOperations.flatEntityToCreate).toHaveLength(1);
    expect(pageLayoutOperations.flatEntityToCreate).toHaveLength(1);
    expect(pageLayoutTabOperations.flatEntityToCreate).toHaveLength(1);
    // The FIELD widget pointing at a field absent from the workspace is
    // dropped, like the standard sync does.
    expect(pageLayoutWidgetOperations.flatEntityToCreate).toHaveLength(1);
    expect(
      pageLayoutWidgetOperations.flatEntityToCreate[0].universalIdentifier,
    ).toBe('standard-widget-uid');
  });

  it('buckets the view field of an app-contributed field under the contributing application', async () => {
    mockWorkspaceCache({
      fieldMetadatas: [
        LABEL_FIELD_METADATA,
        {
          ...OTHER_FIELD_METADATA,
          applicationUniversalIdentifier:
            CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    const contributedViewFieldRun =
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls
        .map(([args]) => args)
        .find(
          (args) =>
            args.applicationUniversalIdentifier ===
              CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER &&
            isDefinedOperations(args, 'viewField'),
        );

    expect(contributedViewFieldRun).toBeDefined();

    const [contributedViewField] =
      contributedViewFieldRun.allFlatEntityOperationByMetadataName.viewField
        .flatEntityToCreate;

    expect(contributedViewField).toMatchObject({
      fieldMetadataUniversalIdentifier: OTHER_FIELD_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('tops up missing curated view field groups on an already-committed standard view (retry safety)', async () => {
    computeStandardMapsMock.mockReturnValue(
      buildStandardMaps({
        views: [
          {
            universalIdentifier: STANDARD_DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          },
        ],
        viewFieldGroups: [
          {
            universalIdentifier: 'standard-group-uid',
            viewUniversalIdentifier: STANDARD_DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          } as never,
        ],
        pageLayouts: [
          {
            universalIdentifier:
              STANDARD_DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    );

    mockWorkspaceCache({
      objectMetadatas: [
        {
          ...OBJECT_METADATA,
          applicationUniversalIdentifier:
            STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      ],
      fieldMetadatas: [],
      views: [
        {
          universalIdentifier: STANDARD_DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          type: ViewType.FIELDS_WIDGET,
          objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    const groupRun = validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls
      .map(([args]) => args)
      .find((args) => isDefinedOperations(args, 'viewFieldGroup'));

    expect(groupRun).toBeDefined();
    expect(groupRun.allFlatEntityOperationByMetadataName.view).toBeUndefined();
    expect(
      groupRun.allFlatEntityOperationByMetadataName.viewFieldGroup
        .flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({ universalIdentifier: 'standard-group-uid' }),
    ]);
  });

  it('leaves a standard object without curated record page untouched, like fresh installs', async () => {
    mockWorkspaceCache({
      objectMetadatas: [
        {
          ...OBJECT_METADATA,
          applicationUniversalIdentifier:
            STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('still backfills the missing view fields and layout of an already-committed view (retry safety)', async () => {
    // A view under the DERIVED identifier is a partial artifact of a previous
    // (partially failed) run, not a caller-authored stack.
    mockWorkspaceCache({
      views: [
        {
          universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          type: ViewType.FIELDS_WIDGET,
          objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledTimes(1);

    const [restRun] =
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls.map(
        ([args]) => args,
      );

    expect(restRun.allFlatEntityOperationByMetadataName.view).toBeUndefined();
    expect(
      restRun.allFlatEntityOperationByMetadataName.viewField.flatEntityToCreate,
    ).toHaveLength(1);
    expect(
      restRun.allFlatEntityOperationByMetadataName.pageLayout
        .flatEntityToCreate,
    ).toHaveLength(1);
  });

  it('performs no write in dry-run mode', async () => {
    mockWorkspaceCache();

    await runOnWorkspace(true);

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });
});
