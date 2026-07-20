import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type Repository } from 'typeorm';

import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

const CORE_VERSION_ID_FIELD =
  STANDARD_OBJECTS.workflowVersion.fields.coreWorkflowVersionId
    .universalIdentifier;

describe('WorkflowVersionCoreSyncService', () => {
  const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';

  let service: WorkflowVersionCoreSyncService;
  let workflowVersionRepository: { upsert: jest.Mock; delete: jest.Mock };
  let workspaceRepository: { findOne: jest.Mock };
  let globalWorkspaceOrmManager: { executeInWorkspaceContext: jest.Mock };
  let workspaceCacheService: {
    getOrRecompute: jest.Mock;
    invalidateAndRecompute: jest.Mock;
  };

  const buildVersion = (
    overrides: Partial<WorkflowVersionWorkspaceEntity> = {},
  ): WorkflowVersionWorkspaceEntity =>
    ({
      id: '1dddc806-4144-5020-898f-b1ab287b89d5',
      workflowId: 'c95c78b4-48d2-56f6-8e15-36ff8572f1d8',
      status: 'DRAFT',
      trigger: null,
      steps: null,
      // Event payloads represent unset uuids as empty strings, not null.
      coreWorkflowVersionId: '',
      ...overrides,
    }) as unknown as WorkflowVersionWorkspaceEntity;

  const mockFieldPresence = (present: boolean) =>
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatFieldMetadataMaps: {
        byUniversalIdentifier: present ? { [CORE_VERSION_ID_FIELD]: {} } : {},
      },
    });

  const upsertedRows = (): Array<{ id: string }> =>
    workflowVersionRepository.upsert.mock.calls[0][1];

  beforeEach(() => {
    workflowVersionRepository = { upsert: jest.fn(), delete: jest.fn() };
    workspaceRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: workspaceId,
        workspaceCustomApplicationId: 'application-1',
      }),
    };
    globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn().mockResolvedValue(undefined),
    };
    workspaceCacheService = {
      getOrRecompute: jest.fn(),
      invalidateAndRecompute: jest.fn().mockResolvedValue(undefined),
    };

    service = new WorkflowVersionCoreSyncService(
      workflowVersionRepository as unknown as WorkspaceScopedRepository<WorkflowVersionEntity>,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      globalWorkspaceOrmManager as unknown as GlobalWorkspaceOrmManager,
      workspaceCacheService as unknown as WorkspaceCacheService,
    );

    jest.spyOn(service['logger'], 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('skips the core id write-back when the workspace lacks the coreWorkflowVersionId field', async () => {
    mockFieldPresence(false);

    await expect(
      service.upsertToCore(workspaceId, [buildVersion()]),
    ).resolves.toBeUndefined();

    expect(workflowVersionRepository.upsert).toHaveBeenCalledTimes(1);
    expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });

  it('generates an id and writes it back for an unlinked version (empty-string id)', async () => {
    mockFieldPresence(true);

    await service.upsertToCore(workspaceId, [buildVersion()]);

    // Empty-string coreWorkflowVersionId is treated as unlinked, not passed through.
    expect(upsertedRows()[0].id).not.toBe('');
    expect(upsertedRows()[0].id.length).toBeGreaterThan(0);
    expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext,
    ).toHaveBeenCalledTimes(1);
  });

  it('reuses the existing id and does not write back for a linked version', async () => {
    mockFieldPresence(true);
    const coreWorkflowVersionId = 'e2b1c0d4-0000-4000-8000-000000000000';

    await service.upsertToCore(workspaceId, [
      buildVersion({
        coreWorkflowVersionId,
      } as Partial<WorkflowVersionWorkspaceEntity>),
    ]);

    expect(upsertedRows()[0].id).toBe(coreWorkflowVersionId);
    expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });
});
