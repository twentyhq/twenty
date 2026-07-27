import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type Repository } from 'typeorm';

import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

const CORE_WORKFLOW_ID_FIELD =
  STANDARD_OBJECTS.workflow.fields.coreWorkflowId.universalIdentifier;

describe('WorkflowCoreSyncService', () => {
  const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';

  let service: WorkflowCoreSyncService;
  let workflowRepository: { upsert: jest.Mock; delete: jest.Mock };
  let workspaceRepository: { findOne: jest.Mock };
  let globalWorkspaceOrmManager: { executeInWorkspaceContext: jest.Mock };
  let workspaceCacheService: { getOrRecompute: jest.Mock };

  const buildWorkflow = (
    overrides: Partial<WorkflowWorkspaceEntity> = {},
  ): WorkflowWorkspaceEntity =>
    ({
      id: '1dddc806-4144-5020-898f-b1ab287b89d5',
      name: 'My workflow',
      // Event payloads represent unset uuids as empty strings, not null.
      lastPublishedVersionId: '',
      coreWorkflowId: '',
      ...overrides,
    }) as unknown as WorkflowWorkspaceEntity;

  const mockFieldPresence = (present: boolean) =>
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatFieldMetadataMaps: {
        byUniversalIdentifier: present ? { [CORE_WORKFLOW_ID_FIELD]: {} } : {},
      },
    });

  const upsertedRows = (): Array<{
    id: string;
    lastPublishedVersionId: string | null;
  }> => workflowRepository.upsert.mock.calls[0][1];

  beforeEach(() => {
    workflowRepository = { upsert: jest.fn(), delete: jest.fn() };
    workspaceRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: workspaceId,
        workspaceCustomApplicationId: 'application-1',
      }),
    };
    globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn().mockResolvedValue(undefined),
    };
    workspaceCacheService = { getOrRecompute: jest.fn() };

    service = new WorkflowCoreSyncService(
      workflowRepository as unknown as WorkspaceScopedRepository<WorkflowEntity>,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      globalWorkspaceOrmManager as unknown as GlobalWorkspaceOrmManager,
      workspaceCacheService as unknown as WorkspaceCacheService,
    );

    jest.spyOn(service['logger'], 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('skips the core id write-back when the workspace lacks the coreWorkflowId field', async () => {
    mockFieldPresence(false);

    await expect(
      service.upsertToCore(workspaceId, [buildWorkflow()]),
    ).resolves.toBeUndefined();

    expect(workflowRepository.upsert).toHaveBeenCalledTimes(1);
    expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });

  it('generates an id, normalizes empty-string uuids and writes back for an unlinked workflow', async () => {
    mockFieldPresence(true);

    await service.upsertToCore(workspaceId, [buildWorkflow()]);

    expect(upsertedRows()[0].id).not.toBe('');
    expect(upsertedRows()[0].id.length).toBeGreaterThan(0);
    // lastPublishedVersionId ('') must be normalized to null for the uuid column.
    expect(upsertedRows()[0].lastPublishedVersionId).toBeNull();
    expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext,
    ).toHaveBeenCalledTimes(1);
  });

  it('reuses the existing id and does not write back for a linked workflow', async () => {
    mockFieldPresence(true);
    const coreWorkflowId = 'e2b1c0d4-0000-4000-8000-000000000000';

    await service.upsertToCore(workspaceId, [
      buildWorkflow({
        coreWorkflowId,
      } as Partial<WorkflowWorkspaceEntity>),
    ]);

    expect(upsertedRows()[0].id).toBe(coreWorkflowId);
    expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });
});
