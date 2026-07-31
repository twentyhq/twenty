import {
  getSystemViewUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { FieldMetadataType, ViewKey } from 'twenty-shared/types';
import { In } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { DemoteAndBackfillApplicationIndexViewCommand } from 'src/database/commands/upgrade-version-command/2-26/2-26-workspace-command-1785255690000-demote-and-backfill-application-index-view.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
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

const DERIVED_VIEW_UNIVERSAL_IDENTIFIER = getSystemViewUniversalIdentifier({
  objectMetadataApplicationUniversalIdentifier: EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  viewKey: ViewKey.INDEX,
});

// An external application object with one displayable field.
const OBJECT_METADATA = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  fieldUniversalIdentifiers: [FIELD_UNIVERSAL_IDENTIFIER],
};

const FIELD_METADATA = {
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'name',
  type: FieldMetadataType.TEXT,
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

type WorkspaceView = {
  id: string;
  universalIdentifier: string;
  key: ViewKey | null;
  applicationUniversalIdentifier?: string;
  deletedAt?: string | null;
  isSystemSideEffect?: boolean;
  objectMetadataUniversalIdentifier?: string;
};

const buildFlatView = (view: WorkspaceView) => ({
  applicationUniversalIdentifier: EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
  deletedAt: null,
  isSystemSideEffect: false,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  ...view,
});

describe('DemoteAndBackfillApplicationIndexViewCommand', () => {
  let command: DemoteAndBackfillApplicationIndexViewCommand;
  let getOrRecomputeMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;
  let viewUpdateMock: jest.Mock;
  let validateBuildAndRunWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    invalidateCacheMock = jest.fn().mockResolvedValue(undefined);
    viewUpdateMock = jest.fn().mockResolvedValue(undefined);
    validateBuildAndRunWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    const viewRepositoryMock = {
      update: viewUpdateMock,
    };

    command = new DemoteAndBackfillApplicationIndexViewCommand(
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
      {
        validateBuildAndRunLegacyWorkspaceMigration:
          validateBuildAndRunWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
      viewRepositoryMock as never,
    );
  });

  const mockWorkspaceCache = ({
    views = [],
    viewFields = [],
  }: {
    views?: ReturnType<typeof buildFlatView>[];
    viewFields?: { universalIdentifier: string }[];
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatViewMaps: buildByUniversalIdentifierMap(views),
      flatViewFieldMaps: buildByUniversalIdentifierMap(viewFields),
      flatObjectMetadataMaps: buildByUniversalIdentifierMap([OBJECT_METADATA]),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap([FIELD_METADATA]),
    });
  };

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('demotes the application INDEX view and backfills the engine-owned one', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'app-view-id',
          universalIdentifier: 'app-view-uid',
          key: ViewKey.INDEX,
        }),
      ],
    });

    await runOnWorkspace();

    // The app view becomes a plain additional view under its manifest
    // identifier.
    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: In(['app-view-id']), workspaceId: WORKSPACE_ID },
      { key: null },
    );
    // Demotions are visible to the backfill pipeline validators.
    expect(invalidateCacheMock).toHaveBeenCalledTimes(1);

    // Two-phase: every application's views are committed before any view
    // field, so cross-application view fields always find their parent view.
    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledTimes(2);

    const [viewPayload, viewFieldPayload] =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls.map(
        ([payload]) => payload,
      );

    expect(viewPayload.applicationUniversalIdentifier).toBe(
      EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
    );
    expect(
      viewPayload.allFlatEntityOperationByMetadataName.view.flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
        key: ViewKey.INDEX,
        isSystemSideEffect: true,
      }),
    ]);
    expect(
      viewPayload.allFlatEntityOperationByMetadataName.viewField,
    ).toBeUndefined();

    expect(viewFieldPayload.applicationUniversalIdentifier).toBe(
      EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
    );
    expect(
      viewFieldPayload.allFlatEntityOperationByMetadataName.view,
    ).toBeUndefined();
    expect(
      viewFieldPayload.allFlatEntityOperationByMetadataName.viewField
        .flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: getSystemViewFieldUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        }),
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        isVisible: true,
        position: 0,
        isSystemSideEffect: true,
      }),
    ]);
  });

  it('backfills an application object that never had an INDEX view', async () => {
    mockWorkspaceCache({ views: [] });

    await runOnWorkspace();

    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledTimes(2);
  });

  it('is idempotent: a fully backfilled object is neither demoted nor re-backfilled', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'engine-view-id',
          universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          key: ViewKey.INDEX,
          isSystemSideEffect: true,
        }),
      ],
      viewFields: [
        {
          universalIdentifier: getSystemViewFieldUniversalIdentifier({
            fieldMetadataApplicationUniversalIdentifier:
              EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
            viewUniversalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          }),
        },
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('backfills the missing view fields of an already-committed engine INDEX view', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'engine-view-id',
          universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          key: ViewKey.INDEX,
          isSystemSideEffect: true,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledTimes(1);

    const [payload] = validateBuildAndRunWorkspaceMigrationMock.mock.calls[0];

    expect(payload.allFlatEntityOperationByMetadataName.view).toBeUndefined();
    expect(
      payload.allFlatEntityOperationByMetadataName.viewField.flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: getSystemViewFieldUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        }),
        viewUniversalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      }),
    ]);
  });

  it('adopts an application INDEX view already authored under the engine derived identifier', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'app-view-id',
          universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          key: ViewKey.INDEX,
        }),
      ],
    });

    await runOnWorkspace();

    // Demoting it and re-creating a view under the same identifier would
    // violate the unique index: the view is promoted in place instead.
    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: In(['app-view-id']), workspaceId: WORKSPACE_ID },
      { key: ViewKey.INDEX, isSystemSideEffect: true },
    );
    expect(invalidateCacheMock).toHaveBeenCalledTimes(1);

    // Only the view fields are backfilled, no view creation.
    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledTimes(1);

    const [payload] = validateBuildAndRunWorkspaceMigrationMock.mock.calls[0];

    expect(payload.allFlatEntityOperationByMetadataName.view).toBeUndefined();
    expect(
      payload.allFlatEntityOperationByMetadataName.viewField.flatEntityToCreate,
    ).toHaveLength(1);
  });

  it('re-promotes a previously demoted view still holding the engine derived identifier', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'demoted-view-id',
          universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          key: null,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: In(['demoted-view-id']), workspaceId: WORKSPACE_ID },
      { key: ViewKey.INDEX, isSystemSideEffect: true },
    );

    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledTimes(1);

    const [payload] = validateBuildAndRunWorkspaceMigrationMock.mock.calls[0];

    expect(payload.allFlatEntityOperationByMetadataName.view).toBeUndefined();
  });

  it('releases a soft-deleted view holding the engine derived identifier before backfilling', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'tombstone-view-id',
          universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
          key: ViewKey.INDEX,
          deletedAt: '2024-01-01T00:00:00.000Z',
        }),
      ],
    });

    await runOnWorkspace();

    // The tombstone moves onto its own primary key so the insert can go
    // through the unique index.
    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: 'tombstone-view-id', workspaceId: WORKSPACE_ID },
      { universalIdentifier: 'tombstone-view-id' },
    );
    expect(invalidateCacheMock).toHaveBeenCalledTimes(1);

    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledTimes(2);

    const [viewPayload] =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0];

    expect(
      viewPayload.allFlatEntityOperationByMetadataName.view.flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: DERIVED_VIEW_UNIVERSAL_IDENTIFIER,
      }),
    ]);
  });

  it('does not write in dry-run mode', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'app-view-id',
          universalIdentifier: 'app-view-uid',
          key: ViewKey.INDEX,
        }),
      ],
    });

    await runOnWorkspace(true);

    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });
});
