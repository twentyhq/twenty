import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { type FeatureFlagKey } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SyncAttachmentRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790266078807-sync-attachment-record-page.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-field-validator.service';

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

const ATTACHMENT = STANDARD_OBJECTS.attachment;
const ATTACHMENT_RECORD_PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.attachmentRecordPage;

const FIELDS_VIEW_UNIVERSAL_IDENTIFIER =
  ATTACHMENT.views.attachmentRecordPageFields.universalIdentifier;
const FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = Object.values(
  ATTACHMENT.views.attachmentRecordPageFields.viewFields,
).map((viewField) => viewField.universalIdentifier);

const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  ATTACHMENT_RECORD_PAGE.universalIdentifier;
const HOME_TAB_UNIVERSAL_IDENTIFIER =
  ATTACHMENT_RECORD_PAGE.tabs.home.universalIdentifier;
const FIELDS_WIDGET_UNIVERSAL_IDENTIFIER =
  ATTACHMENT_RECORD_PAGE.tabs.home.widgets.fields.universalIdentifier;
const PREVIEW_WIDGET_UNIVERSAL_IDENTIFIER =
  ATTACHMENT_RECORD_PAGE.tabs.home.widgets.preview.universalIdentifier;
const ATTACHED_TO_WIDGET_UNIVERSAL_IDENTIFIER =
  ATTACHMENT_RECORD_PAGE.tabs.home.widgets.attachedTo.universalIdentifier;
const WIDGET_UNIVERSAL_IDENTIFIERS = [
  PREVIEW_WIDGET_UNIVERSAL_IDENTIFIER,
  FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
  ATTACHED_TO_WIDGET_UNIVERSAL_IDENTIFIER,
];

const STANDARD_MAPS = jest
  .requireActual<
    typeof import('src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant')
  >('src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant')
  .computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-09-23T00:00:00.000Z',
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: STANDARD_APPLICATION.id,
  }).allFlatEntityMaps;

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

describe('SyncAttachmentRecordPageCommand', () => {
  let command: SyncAttachmentRecordPageCommand;
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
        flatViewFieldMaps: buildMaps(
          FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.map(
            (universalIdentifier) =>
              STANDARD_MAPS.flatViewFieldMaps.byUniversalIdentifier[
                universalIdentifier
              ]!,
          ),
        ),
        flatPageLayoutMaps: buildMaps([
          { universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER },
        ]),
        flatPageLayoutTabMaps: buildMaps([
          { universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER },
        ]),
        flatPageLayoutWidgetMaps: buildMaps([
          STANDARD_MAPS.flatPageLayoutWidgetMaps.byUniversalIdentifier[
            PREVIEW_WIDGET_UNIVERSAL_IDENTIFIER
          ]!,
          buildStandardFieldsWidget(),
          STANDARD_MAPS.flatPageLayoutWidgetMaps.byUniversalIdentifier[
            ATTACHED_TO_WIDGET_UNIVERSAL_IDENTIFIER
          ]!,
        ]),
      },
    } as unknown as ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >);

    command = new SyncAttachmentRecordPageCommand(
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
    hasAttachmentObject = true,
    missingFieldIdentifiers = [] as string[],
    existingViews = [] as {
      id: string;
      universalIdentifier: string;
      deletedAt?: string;
    }[],
    existingViewFields = [] as string[],
    existingViewFieldsInView = [] as {
      universalIdentifier: string;
      viewId: string;
      fieldMetadataUniversalIdentifier: string;
      deletedAt?: string;
    }[],
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
        hasAttachmentObject
          ? [{ universalIdentifier: ATTACHMENT.universalIdentifier }]
          : [],
      ),
      flatFieldMetadataMaps: {
        byUniversalIdentifier: Object.fromEntries(
          Object.entries(
            STANDARD_MAPS.flatFieldMetadataMaps.byUniversalIdentifier,
          ).filter(
            ([identifier]) => !missingFieldIdentifiers.includes(identifier),
          ),
        ),
      },
      flatViewMaps: buildMaps(existingViews),
      flatViewFieldMaps: buildMaps([
        ...existingViewFields.map((universalIdentifier) => ({
          universalIdentifier,
        })),
        ...existingViewFieldsInView,
      ]),
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
    expect(
      payload.pageLayoutWidget.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual(WIDGET_UNIVERSAL_IDENTIFIERS);
  });

  it.each([
    {
      description: 'file',
      missingFieldIdentifier: ATTACHMENT.fields.file.universalIdentifier,
      skippedWidgetIdentifier: PREVIEW_WIDGET_UNIVERSAL_IDENTIFIER,
    },
    {
      description: 'targetPerson',
      missingFieldIdentifier:
        ATTACHMENT.fields.targetPerson.universalIdentifier,
      skippedWidgetIdentifier: ATTACHED_TO_WIDGET_UNIVERSAL_IDENTIFIER,
    },
  ])(
    'leaves out the widget of a missing $description field instead of failing',
    async ({ missingFieldIdentifier, skippedWidgetIdentifier }) => {
      mockWorkspaceCache({ missingFieldIdentifiers: [missingFieldIdentifier] });

      await runOnWorkspace();

      expect(
        getMigrationPayload().pageLayoutWidget.flatEntityToCreate.map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        ),
      ).toEqual(
        WIDGET_UNIVERSAL_IDENTIFIERS.filter(
          (identifier) => identifier !== skippedWidgetIdentifier,
        ),
      );
      expect(loggerWarnMock).toHaveBeenCalledTimes(1);
    },
  );

  it('does not add a field the existing fields view already shows under another identifier', async () => {
    mockWorkspaceCache({
      existingViews: [
        {
          id: EXISTING_FIELDS_VIEW_ID,
          universalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
        },
      ],
      existingViewFieldsInView: [
        {
          universalIdentifier: 'user-created-view-field',
          viewId: EXISTING_FIELDS_VIEW_ID,
          fieldMetadataUniversalIdentifier:
            ATTACHMENT.fields.createdBy.universalIdentifier,
        },
      ],
    });

    await runOnWorkspace();

    expect(
      getMigrationPayload().viewField.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual([
      ATTACHMENT.views.attachmentRecordPageFields.viewFields.createdAt
        .universalIdentifier,
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

  it.each([
    {
      description: 'createdBy',
      missingFieldIdentifiers: [
        ATTACHMENT.fields.createdBy.universalIdentifier,
      ],
      omittedViewFields: 1,
    },
    {
      description: 'the historical system fields',
      missingFieldIdentifiers: [
        ATTACHMENT.fields.createdBy.universalIdentifier,
        ATTACHMENT.fields.updatedBy.universalIdentifier,
        ATTACHMENT.fields.position.universalIdentifier,
        ATTACHMENT.fields.searchVector.universalIdentifier,
      ],
      omittedViewFields: 1,
    },
    {
      description: 'other referenced fields',
      missingFieldIdentifiers: [
        ATTACHMENT.fields.createdBy.universalIdentifier,
        ATTACHMENT.fields.createdAt.universalIdentifier,
      ],
      omittedViewFields: 2,
    },
  ])(
    'creates a valid page without backfilling missing $description',
    async ({ missingFieldIdentifiers, omittedViewFields }) => {
      mockWorkspaceCache({ missingFieldIdentifiers });

      const { flatFieldMetadataMaps } = await getOrRecomputeMock();
      const viewFieldValidator = new FlatViewFieldValidatorService();
      const standardView =
        STANDARD_MAPS.flatViewMaps.byUniversalIdentifier[
          FIELDS_VIEW_UNIVERSAL_IDENTIFIER
        ]!;
      const validateViewField = (viewField: FlatViewField) =>
        viewFieldValidator.validateFlatViewFieldCreation({
          flatEntityToValidate: viewField,
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
            ...STANDARD_MAPS,
            flatFieldMetadataMaps,
            flatViewFieldMaps: createEmptyFlatEntityMaps(),
            flatViewMaps: buildMaps([
              { ...standardView, viewFieldUniversalIdentifiers: [] },
            ]),
          },
          remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
          additionalCacheDataMaps: {
            featureFlagsMap: {} as Record<FeatureFlagKey, boolean>,
          },
          buildOptions: {
            isSystemBuild: true,
            applicationUniversalIdentifier:
              STANDARD_APPLICATION.universalIdentifier,
          },
          workspaceId: WORKSPACE_ID,
        });

      const originalViewFields = FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.map(
        (identifier) =>
          STANDARD_MAPS.flatViewFieldMaps.byUniversalIdentifier[identifier]!,
      );

      expect(
        originalViewFields.flatMap(
          (viewField) => validateViewField(viewField).errors,
        ),
      ).toHaveLength(omittedViewFields);

      await runOnWorkspace();

      const payload = getMigrationPayload();
      const viewFields: FlatViewField[] = payload.viewField.flatEntityToCreate;

      expect(viewFields).toHaveLength(
        FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.length - omittedViewFields,
      );
      expect(
        viewFields.flatMap((viewField) => validateViewField(viewField).errors),
      ).toEqual([]);
      expect(payload.fieldMetadata).toBeUndefined();
      expect(payload.pageLayout.flatEntityToCreate).toHaveLength(1);
      expect(payload.pageLayoutTab.flatEntityToCreate).toHaveLength(1);
      expect(payload.pageLayoutWidget.flatEntityToCreate).toHaveLength(3);
      expect(loggerWarnMock).toHaveBeenCalledTimes(omittedViewFields);

      mockWorkspaceCache({
        missingFieldIdentifiers,
        existingViews: [
          {
            id: EXISTING_FIELDS_VIEW_ID,
            universalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
          },
        ],
        existingViewFields: viewFields.map(
          (viewField) => viewField.universalIdentifier,
        ),
        existingPageLayouts: [
          { universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER },
        ],
        existingPageLayoutTabs: [
          { universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER },
        ],
        existingPageLayoutWidgets: WIDGET_UNIVERSAL_IDENTIFIERS,
      });

      await runOnWorkspace();

      expect(
        validateBuildAndRunLegacyWorkspaceMigrationMock,
      ).toHaveBeenCalledTimes(1);
    },
  );

  it('adds a previously omitted view field on an explicit rerun after its metadata is restored', async () => {
    const createdByViewFieldIdentifier =
      ATTACHMENT.views.attachmentRecordPageFields.viewFields.createdBy
        .universalIdentifier;

    mockWorkspaceCache({
      existingViews: [
        {
          id: EXISTING_FIELDS_VIEW_ID,
          universalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
        },
      ],
      existingViewFields: FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.filter(
        (identifier) => identifier !== createdByViewFieldIdentifier,
      ),
      existingPageLayouts: [
        { universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER },
      ],
      existingPageLayoutTabs: [
        { universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER },
      ],
      existingPageLayoutWidgets: WIDGET_UNIVERSAL_IDENTIFIERS,
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.viewField.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: createdByViewFieldIdentifier,
        fieldMetadataUniversalIdentifier:
          ATTACHMENT.fields.createdBy.universalIdentifier,
      }),
    ]);
    expect(payload.fieldMetadata).toBeUndefined();
    for (const metadataName of [
      'view',
      'pageLayout',
      'pageLayoutTab',
      'pageLayoutWidget',
    ]) {
      expect(payload[metadataName].flatEntityToCreate).toEqual([]);
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
      existingViewFields: FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
    });

    await runOnWorkspace();

    const payload = getMigrationPayload();

    expect(payload.view.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toContainEqual(
      expect.objectContaining({
        universalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
        configuration: expect.objectContaining({
          viewId: EXISTING_FIELDS_VIEW_ID,
        }),
      }),
    );
  });

  it('creates only what a partially provisioned workspace is missing', async () => {
    mockWorkspaceCache({
      existingViews: [
        {
          id: EXISTING_FIELDS_VIEW_ID,
          universalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
        },
      ],
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
    expect(payload.viewField.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayout.flatEntityToCreate).toEqual([]);
    expect(payload.pageLayoutTab.flatEntityToCreate).toEqual([]);
    expect(
      payload.pageLayoutWidget.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual(WIDGET_UNIVERSAL_IDENTIFIERS);
  });

  it('is a no-op on a workspace that already has the record page', async () => {
    mockWorkspaceCache({
      existingViews: [
        {
          id: EXISTING_FIELDS_VIEW_ID,
          universalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
        },
      ],
      existingViewFields: FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
      existingPageLayouts: [
        { universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER },
      ],
      existingPageLayoutTabs: [
        { universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER },
      ],
      existingPageLayoutWidgets: WIDGET_UNIVERSAL_IDENTIFIERS,
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('skips a workspace without the attachment object', async () => {
    mockWorkspaceCache({ hasAttachmentObject: false });

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

  it('validates the migration on a dry run without executing it', async () => {
    mockWorkspaceCache();

    await runOnWorkspace(true);

    expect(loggerLogMock).toHaveBeenCalledWith(
      expect.stringContaining('[DRY RUN]'),
    );
    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledWith(expect.objectContaining({ dryRun: true }));
  });

  it.each([false, true])(
    'throws when validation fails (dryRun=%s)',
    async (dryRun) => {
      const failedResult = { status: 'fail' };

      mockWorkspaceCache();
      validateBuildAndRunLegacyWorkspaceMigrationMock.mockResolvedValue(
        failedResult,
      );

      await expect(runOnWorkspace(dryRun)).rejects.toThrow(
        `Failed to sync the attachment record page for workspace ${WORKSPACE_ID}`,
      );
      // the typed exception is what carries the failed build result to callers
      await expect(runOnWorkspace(dryRun)).rejects.toMatchObject({
        name: 'WorkspaceMigrationBuilderException',
        failedWorkspaceMigrationBuildResult: failedResult,
      });
    },
  );
});
