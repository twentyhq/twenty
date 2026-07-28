import {
  getSystemViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { FieldMetadataType, ViewKey } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { DemoteAndBackfillApplicationIndexViewCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785227955171-demote-and-backfill-application-index-view.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
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
  applicationUniversalIdentifier: EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
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

    const entityManagerMock = {
      getRepository: (entity: unknown) => {
        if (entity === ViewEntity) {
          return { update: viewUpdateMock };
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
  }: {
    views?: ReturnType<typeof buildFlatView>[];
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatViewMaps: buildByUniversalIdentifierMap(views),
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
      { id: 'app-view-id', workspaceId: WORKSPACE_ID },
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
        universalIdentifier: getViewFieldUniversalIdentifier({
          applicationUniversalIdentifier:
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
    // No demotion happened, so no raw-update cache invalidation either; the
    // pipeline handles its own.
    expect(invalidateCacheMock).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledTimes(2);
  });

  it('is idempotent: an engine-owned INDEX view is neither demoted nor re-backfilled', async () => {
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
    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
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
