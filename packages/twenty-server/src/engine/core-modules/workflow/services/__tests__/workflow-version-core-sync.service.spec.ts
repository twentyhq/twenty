import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import {
  CoreWorkflowMetadataException,
  CoreWorkflowMetadataExceptionCode,
} from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const WORKFLOW_ID = '20202020-0000-4000-8000-000000000002';
const CORE_WORKFLOW_ID = '20202020-0000-4000-8000-000000000003';
const CORE_VERSION_ID = '20202020-0000-4000-8000-000000000004';
const OTHER_CORE_VERSION_ID = '20202020-0000-4000-8000-000000000005';
const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000006';

const buildWorkspaceVersion = (
  coreVersionId: string | null = CORE_VERSION_ID,
) =>
  Object.assign(new WorkflowVersionWorkspaceEntity(), {
    id: '20202020-0000-4000-8000-000000000007',
    workflowId: WORKFLOW_ID,
    coreWorkflowVersionId: coreVersionId,
    status: WorkflowVersionStatus.DRAFT,
    trigger: null,
    steps: [],
  });

const buildFlatVersion = (id = CORE_VERSION_ID) => ({
  id,
  coreWorkflowId: CORE_WORKFLOW_ID,
  universalIdentifier: `universal-${id}`,
  createdAt: '2026-01-01T00:00:00.000Z',
});

const buildMaps = (versions = [buildFlatVersion()]) => ({
  ...createEmptyFlatEntityMaps(),
  universalIdentifierById: Object.fromEntries(
    versions.map(({ id, universalIdentifier }) => [id, universalIdentifier]),
  ),
  byUniversalIdentifier: Object.fromEntries(
    versions.map((version) => [version.universalIdentifier, version]),
  ),
});

describe('WorkflowVersionCoreSyncService cache recovery', () => {
  let service: WorkflowVersionCoreSyncService;
  const coreRepository = { find: jest.fn() };
  const workflowRepository = { find: jest.fn() };
  const workspaceVersionRepository = { update: jest.fn() };
  const workspaceRepository = { manager: { query: jest.fn() } };
  const migrationService = { validateBuildAndRunWorkspaceMigration: jest.fn() };
  const flatEntityMapsCacheService = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
    invalidateFlatEntityMaps: jest.fn(),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn(),
    invalidateAndRecompute: jest.fn(),
  };
  const applicationService = {
    findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    coreRepository.find.mockResolvedValue([
      { id: CORE_VERSION_ID, coreWorkflowId: CORE_WORKFLOW_ID },
    ]);
    workflowRepository.find.mockResolvedValue([
      { id: WORKFLOW_ID, coreWorkflowId: CORE_WORKFLOW_ID },
    ]);
    flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
      {
        flatWorkflowVersionMaps: buildMaps(),
      },
    );
    flatEntityMapsCacheService.invalidateFlatEntityMaps.mockResolvedValue(
      undefined,
    );
    migrationService.validateBuildAndRunWorkspaceMigration.mockResolvedValue({
      status: 'success',
    });
    applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow.mockResolvedValue(
      {
        workspaceCustomFlatApplication: {
          universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      },
    );
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatFieldMetadataMaps: {
        byUniversalIdentifier: {
          [STANDARD_OBJECTS.workflowVersion.fields.coreWorkflowVersionId
            .universalIdentifier]: {},
        },
      },
    });

    const module = await Test.createTestingModule({
      providers: [
        WorkflowVersionCoreSyncService,
        {
          provide: getWorkspaceScopedRepositoryToken(WorkflowVersionEntity),
          useValue: coreRepository,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: workspaceRepository,
        },
        {
          provide: WorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: (callback: () => Promise<unknown>) =>
              callback(),
            getRepository: (objectName: string) =>
              objectName === 'workflow'
                ? workflowRepository
                : workspaceVersionRepository,
          },
        },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: migrationService,
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: flatEntityMapsCacheService,
        },
        { provide: ApplicationService, useValue: applicationService },
        { provide: CacheStorageNamespace.ModuleWorkflow, useValue: {} },
      ],
    }).compile();
    service = module.get(WorkflowVersionCoreSyncService);
  });

  const expectExistingVersionsUpdated = (ids = [CORE_VERSION_ID]) => {
    expect(
      migrationService.validateBuildAndRunWorkspaceMigration,
    ).toHaveBeenLastCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      isSystemBuild: false,
      allFlatEntityOperationByMetadataName: {
        workflowVersion: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: ids.map((id) =>
            expect.objectContaining({
              ...buildFlatVersion(id),
              status: WorkflowVersionStatus.DRAFT,
              steps: [],
              triggers: null,
            }),
          ),
        },
      },
    });
    expect(workspaceVersionRepository.update).not.toHaveBeenCalled();
  };

  const expectNoWrites = () => {
    expect(
      migrationService.validateBuildAndRunWorkspaceMigration,
    ).not.toHaveBeenCalled();
    expect(workspaceVersionRepository.update).not.toHaveBeenCalled();
    expect(workspaceCacheService.invalidateAndRecompute).not.toHaveBeenCalled();
  };

  it('updates an existing version without refreshing a current map', async () => {
    await service.upsertToCore(WORKSPACE_ID, [buildWorkspaceVersion()]);
    expectExistingVersionsUpdated();
    expect(
      flatEntityMapsCacheService.invalidateFlatEntityMaps,
    ).not.toHaveBeenCalled();
  });

  it('refreshes a stale map once and preserves the existing version identity', async () => {
    flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValueOnce(
      {
        flatWorkflowVersionMaps: buildMaps([]),
      },
    );
    await service.upsertToCore(WORKSPACE_ID, [buildWorkspaceVersion()]);
    expectExistingVersionsUpdated();
    expect(
      flatEntityMapsCacheService.invalidateFlatEntityMaps,
    ).toHaveBeenCalledTimes(1);
    expect(
      flatEntityMapsCacheService.invalidateFlatEntityMaps,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      flatMapsKeys: ['flatWorkflowVersionMaps'],
    });
    expect(
      flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps,
    ).toHaveBeenCalledTimes(2);
    for (const [args] of flatEntityMapsCacheService
      .getOrRecomputeManyOrAllFlatEntityMaps.mock.calls) {
      expect(args).toEqual({
        workspaceId: WORKSPACE_ID,
        flatMapsKeys: ['flatWorkflowVersionMaps'],
      });
    }
  });

  it('refreshes a map whose id index exists but whose entity is missing', async () => {
    flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValueOnce(
      {
        flatWorkflowVersionMaps: { ...buildMaps(), byUniversalIdentifier: {} },
      },
    );
    await service.upsertToCore(WORKSPACE_ID, [buildWorkspaceVersion()]);
    expectExistingVersionsUpdated();
    expect(
      flatEntityMapsCacheService.invalidateFlatEntityMaps,
    ).toHaveBeenCalledTimes(1);
  });

  it('preserves the error and performs no writes when the refreshed map still lacks the version', async () => {
    flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
      {
        flatWorkflowVersionMaps: buildMaps([]),
      },
    );
    const execution = service.upsertToCore(WORKSPACE_ID, [
      buildWorkspaceVersion(),
    ]);
    await expect(execution).rejects.toBeInstanceOf(
      CoreWorkflowMetadataException,
    );
    await expect(execution).rejects.toMatchObject({
      code: CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_NOT_FOUND,
      message: `Core workflow version ${CORE_VERSION_ID} is persisted but missing from the flat entity maps`,
    });
    expect(
      flatEntityMapsCacheService.invalidateFlatEntityMaps,
    ).toHaveBeenCalledTimes(1);
    expect(
      flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps,
    ).toHaveBeenCalledTimes(2);
    expectNoWrites();
  });

  it('uses one refresh for all missing versions in a batch', async () => {
    coreRepository.find.mockResolvedValue([
      { id: CORE_VERSION_ID, coreWorkflowId: CORE_WORKFLOW_ID },
      { id: OTHER_CORE_VERSION_ID, coreWorkflowId: CORE_WORKFLOW_ID },
    ]);
    flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps
      .mockResolvedValueOnce({ flatWorkflowVersionMaps: buildMaps([]) })
      .mockResolvedValue({
        flatWorkflowVersionMaps: buildMaps([
          buildFlatVersion(),
          buildFlatVersion(OTHER_CORE_VERSION_ID),
        ]),
      });
    const otherVersion = buildWorkspaceVersion(OTHER_CORE_VERSION_ID);
    otherVersion.id = '20202020-0000-4000-8000-000000000008';
    await service.upsertToCore(WORKSPACE_ID, [
      buildWorkspaceVersion(),
      otherVersion,
    ]);
    expectExistingVersionsUpdated([CORE_VERSION_ID, OTHER_CORE_VERSION_ID]);
    expect(
      flatEntityMapsCacheService.invalidateFlatEntityMaps,
    ).toHaveBeenCalledTimes(1);
  });

  it('does not partially write a batch when only some versions recover', async () => {
    coreRepository.find.mockResolvedValue([
      { id: CORE_VERSION_ID, coreWorkflowId: CORE_WORKFLOW_ID },
      { id: OTHER_CORE_VERSION_ID, coreWorkflowId: CORE_WORKFLOW_ID },
    ]);
    flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValueOnce(
      {
        flatWorkflowVersionMaps: buildMaps([]),
      },
    );
    const otherVersion = buildWorkspaceVersion(OTHER_CORE_VERSION_ID);
    otherVersion.id = '20202020-0000-4000-8000-000000000008';
    await expect(
      service.upsertToCore(WORKSPACE_ID, [
        buildWorkspaceVersion(),
        otherVersion,
      ]),
    ).rejects.toThrow(
      `Core workflow version ${OTHER_CORE_VERSION_ID} is persisted but missing from the flat entity maps`,
    );
    expect(
      flatEntityMapsCacheService.invalidateFlatEntityMaps,
    ).toHaveBeenCalledTimes(1);
    expectNoWrites();
  });

  it('propagates refresh failures without writing or retrying again', async () => {
    flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValueOnce(
      {
        flatWorkflowVersionMaps: buildMaps([]),
      },
    );
    const error = new Error('Cache provider unavailable');
    flatEntityMapsCacheService.invalidateFlatEntityMaps.mockRejectedValue(
      error,
    );
    await expect(
      service.upsertToCore(WORKSPACE_ID, [buildWorkspaceVersion()]),
    ).rejects.toBe(error);
    expect(
      flatEntityMapsCacheService.invalidateFlatEntityMaps,
    ).toHaveBeenCalledTimes(1);
    expectNoWrites();
  });

  it('can rerun after recovery without creating duplicate versions', async () => {
    flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValueOnce(
      {
        flatWorkflowVersionMaps: buildMaps([]),
      },
    );
    const version = buildWorkspaceVersion();
    await service.upsertToCore(WORKSPACE_ID, [version]);
    expectExistingVersionsUpdated();
    await service.upsertToCore(WORKSPACE_ID, [version]);
    expectExistingVersionsUpdated();
    expect(
      migrationService.validateBuildAndRunWorkspaceMigration,
    ).toHaveBeenCalledTimes(2);
    expect(
      flatEntityMapsCacheService.invalidateFlatEntityMaps,
    ).toHaveBeenCalledTimes(1);
    expect(version.coreWorkflowVersionId).toBe(CORE_VERSION_ID);
  });

  it('creates a genuinely new version without refreshing the map', async () => {
    coreRepository.find.mockResolvedValue([]);
    const version = buildWorkspaceVersion(null);
    await service.upsertToCore(WORKSPACE_ID, [version]);
    expect(
      flatEntityMapsCacheService.invalidateFlatEntityMaps,
    ).not.toHaveBeenCalled();
    expect(
      migrationService.validateBuildAndRunWorkspaceMigration,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        allFlatEntityOperationByMetadataName: {
          workflowVersion: {
            flatEntityToCreate: [
              expect.objectContaining({
                workspaceWorkflowVersionId: version.id,
              }),
            ],
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      }),
    );
    expect(workspaceVersionRepository.update).toHaveBeenCalledWith(version.id, {
      coreWorkflowVersionId: expect.any(String),
    });
  });

  it('does not access the cache or write for an empty batch', async () => {
    await service.upsertToCore(WORKSPACE_ID, []);
    expect(coreRepository.find).not.toHaveBeenCalled();
    expect(
      flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps,
    ).not.toHaveBeenCalled();
    expectNoWrites();
  });
});
