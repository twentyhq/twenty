import {
  getSystemViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { FieldMetadataType, ViewKey } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ReconcileIndexViewUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785227955169-reconcile-index-view-universal-identifier.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000aa';
const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000ad';
const EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000ae';
const OBJECT_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000bb';
const FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000cc';

const DERIVED_VIEW_UNIVERSAL_IDENTIFIER = getSystemViewUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  viewKey: ViewKey.INDEX,
});
const DERIVED_VIEW_FIELD_UNIVERSAL_IDENTIFIER = getViewFieldUniversalIdentifier(
  {
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  },
);

const OBJECT_METADATA = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier: null as string | null,
  fieldUniversalIdentifiers: [] as string[],
};

type WorkspaceView = {
  id: string;
  universalIdentifier: string;
  key: ViewKey | null;
  applicationUniversalIdentifier?: string;
  deletedAt?: string | null;
  isSystemSideEffect?: boolean;
  objectMetadataUniversalIdentifier?: string;
  viewFieldUniversalIdentifiers?: string[];
};

type WorkspaceViewField = {
  id: string;
  universalIdentifier: string;
  applicationUniversalIdentifier?: string;
  fieldMetadataUniversalIdentifier?: string;
  deletedAt?: string | null;
  isSystemSideEffect?: boolean;
};

const buildFlatView = (view: WorkspaceView) => ({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  deletedAt: null,
  isSystemSideEffect: false,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  viewFieldUniversalIdentifiers: [],
  ...view,
});

const buildFlatViewField = (viewField: WorkspaceViewField) => ({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  deletedAt: null,
  isSystemSideEffect: false,
  ...viewField,
});

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

describe('ReconcileIndexViewUniversalIdentifierCommand', () => {
  let command: ReconcileIndexViewUniversalIdentifierCommand;
  let getOrRecomputeMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;
  let viewUpdateMock: jest.Mock;
  let viewFieldUpdateMock: jest.Mock;
  let validateBuildAndRunWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    invalidateCacheMock = jest.fn().mockResolvedValue(undefined);
    viewUpdateMock = jest.fn().mockResolvedValue(undefined);
    viewFieldUpdateMock = jest.fn().mockResolvedValue(undefined);
    validateBuildAndRunWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    const entityManagerMock = {
      getRepository: (entity: unknown) => {
        if (entity === ViewEntity) {
          return { update: viewUpdateMock };
        }
        if (entity === ViewFieldEntity) {
          return { update: viewFieldUpdateMock };
        }
        throw new Error('Unexpected repository');
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

    command = new ReconcileIndexViewUniversalIdentifierCommand(
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
              universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            },
          }),
      } as unknown as ApplicationService,
      {
        validateBuildAndRunWorkspaceMigration:
          validateBuildAndRunWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
      viewRepositoryMock as never,
      {} as never,
    );
  });

  const mockWorkspaceCache = ({
    views,
    viewFields = [],
    objects = [OBJECT_METADATA],
    fieldMetadatas = [],
  }: {
    views: ReturnType<typeof buildFlatView>[];
    viewFields?: ReturnType<typeof buildFlatViewField>[];
    objects?: (typeof OBJECT_METADATA)[];
    fieldMetadatas?: {
      universalIdentifier: string;
      applicationUniversalIdentifier: string;
      name: string;
      type: FieldMetadataType;
    }[];
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatViewMaps: buildByUniversalIdentifierMap(views),
      flatViewFieldMaps: buildByUniversalIdentifierMap(viewFields),
      flatObjectMetadataMaps: buildByUniversalIdentifierMap(objects),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap(fieldMetadatas),
    });
  };

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('re-owns an underived INDEX view and its view fields', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: 'legacy-view-uid',
          key: ViewKey.INDEX,
          viewFieldUniversalIdentifiers: ['legacy-view-field-uid'],
        }),
      ],
      viewFields: [
        buildFlatViewField({
          id: 'view-field-id',
          universalIdentifier: 'legacy-view-field-uid',
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: 'view-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
    expect(viewFieldUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewFieldUpdateMock).toHaveBeenCalledWith(
      { id: 'view-field-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
    // Parents aggregate the re-owned identifiers and children resolve them as
    // universal foreign keys, so invalidation must cover the whole closure.
    expect(invalidateCacheMock).toHaveBeenCalledTimes(1);
    expect(invalidateCacheMock.mock.calls[0][0].allFlatEntityMapsKeys).toEqual(
      expect.arrayContaining([
        'flatViewMaps',
        'flatViewFieldMaps',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatPageLayoutWidgetMaps',
      ]),
    );
  });

  it('skips a soft-deleted INDEX view coexisting with an active one on the same object', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'soft-deleted-view-id',
          universalIdentifier: 'soft-deleted-view-uid',
          key: ViewKey.INDEX,
          deletedAt: '2024-01-01T00:00:00.000Z',
        }),
        buildFlatView({
          id: 'active-view-id',
          universalIdentifier: 'active-view-uid',
          key: ViewKey.INDEX,
        }),
      ],
    });

    await runOnWorkspace();

    // Both views derive the same identifier: re-owning the soft-deleted one
    // too would violate the (workspaceId, universalIdentifier) unique index.
    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: 'active-view-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
  });

  it('re-owns only the active row of a soft-deleted + re-created view field pair', async () => {
    // The (fieldMetadataId, viewId) unique index is partial on deletedAt, so a
    // removed then re-added column leaves two rows deriving the same
    // universal identifier.
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: 'legacy-view-uid',
          key: ViewKey.INDEX,
          viewFieldUniversalIdentifiers: [
            'soft-deleted-view-field-uid',
            'active-view-field-uid',
          ],
        }),
      ],
      viewFields: [
        buildFlatViewField({
          id: 'soft-deleted-view-field-id',
          universalIdentifier: 'soft-deleted-view-field-uid',
          deletedAt: '2024-01-01T00:00:00.000Z',
        }),
        buildFlatViewField({
          id: 'active-view-field-id',
          universalIdentifier: 'active-view-field-uid',
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewFieldUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewFieldUpdateMock).toHaveBeenCalledWith(
      { id: 'active-view-field-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
  });

  it('demotes an external application INDEX view and backfills the engine-owned one', async () => {
    const externalObjectMetadata = {
      ...OBJECT_METADATA,
      applicationUniversalIdentifier:
        EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
      labelIdentifierFieldMetadataUniversalIdentifier:
        FIELD_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifiers: [FIELD_UNIVERSAL_IDENTIFIER],
    };

    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'external-app-view-id',
          universalIdentifier: 'external-app-view-uid',
          key: ViewKey.INDEX,
          applicationUniversalIdentifier:
            EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
          viewFieldUniversalIdentifiers: ['external-app-view-field-uid'],
        }),
      ],
      viewFields: [
        buildFlatViewField({
          id: 'external-app-view-field-id',
          universalIdentifier: 'external-app-view-field-uid',
          applicationUniversalIdentifier:
            EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ],
      objects: [externalObjectMetadata],
      fieldMetadatas: [
        {
          universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          applicationUniversalIdentifier:
            EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
          name: 'name',
          type: FieldMetadataType.TEXT,
        },
      ],
    });

    await runOnWorkspace();

    // The app view becomes a plain additional view under its manifest
    // identifier; its view fields are not re-owned.
    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: 'external-app-view-id', workspaceId: WORKSPACE_ID },
      { key: null },
    );
    expect(viewFieldUpdateMock).not.toHaveBeenCalled();

    // The engine-owned INDEX view is backfilled through the migration
    // pipeline with the full default layout.
    const derivedExternalViewUniversalIdentifier =
      getSystemViewUniversalIdentifier({
        applicationUniversalIdentifier:
          EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
        objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        viewKey: ViewKey.INDEX,
      });

    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledTimes(1);

    const backfillPayload =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0];

    expect(backfillPayload.applicationUniversalIdentifier).toBe(
      EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
    );
    expect(
      backfillPayload.allFlatEntityOperationByMetadataName.view
        .flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: derivedExternalViewUniversalIdentifier,
        key: ViewKey.INDEX,
        isSystemSideEffect: true,
      }),
    ]);
    expect(
      backfillPayload.allFlatEntityOperationByMetadataName.viewField
        .flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: getViewFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: derivedExternalViewUniversalIdentifier,
          fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        }),
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        isVisible: true,
        position: 0,
        isSystemSideEffect: true,
      }),
    ]);
  });

  it('re-owns an external application view field living on a standard-owned INDEX view', async () => {
    // e.g. an app that declared explicit columns on a standard INDEX view:
    // those must converge on the derived scheme so manifest deletion inference
    // never drops them once the app stops declaring them.
    const derivedExternalViewFieldUniversalIdentifier =
      getViewFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      });

    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: 'legacy-view-uid',
          key: ViewKey.INDEX,
          applicationUniversalIdentifier:
            STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          viewFieldUniversalIdentifiers: ['external-app-view-field-uid'],
        }),
      ],
      viewFields: [
        buildFlatViewField({
          id: 'external-app-view-field-id',
          universalIdentifier: 'external-app-view-field-uid',
          applicationUniversalIdentifier:
            EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewFieldUpdateMock).toHaveBeenCalledWith(
      { id: 'external-app-view-field-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: derivedExternalViewFieldUniversalIdentifier,
        isSystemSideEffect: true,
      },
    );
  });

  it('does nothing when the INDEX view and its view fields are already derived and system-owned', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          key: ViewKey.INDEX,
          isSystemSideEffect: true,
          viewFieldUniversalIdentifiers: [
            DERIVED_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          ],
        }),
      ],
      viewFields: [
        buildFlatViewField({
          id: 'view-field-id',
          universalIdentifier: DERIVED_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          isSystemSideEffect: true,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(viewFieldUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('does not write in dry-run mode', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: 'legacy-view-uid',
          key: ViewKey.INDEX,
        }),
      ],
    });

    await runOnWorkspace(true);

    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(viewFieldUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });
});
