import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const APPLICATION_ID = '20202020-0000-4000-8000-000000000002';
const OWNED_CORE_WORKFLOW_ID = '20202020-0000-4000-8000-000000000003';
const FOREIGN_CORE_WORKFLOW_ID = '20202020-0000-4000-8000-000000000004';

const buildWorkflow = (
  overrides: Partial<WorkflowWorkspaceEntity>,
): WorkflowWorkspaceEntity =>
  ({
    id: '20202020-0000-4000-8000-00000000000a',
    name: 'My workflow',
    lastPublishedVersionId: null,
    coreWorkflowId: null,
    ...overrides,
  }) as WorkflowWorkspaceEntity;

describe('WorkflowCoreSyncService', () => {
  let service: WorkflowCoreSyncService;
  let coreWorkflowRepository: { find: jest.Mock; upsert: jest.Mock };
  let workspaceWorkflowRepository: { update: jest.Mock };

  beforeEach(async () => {
    coreWorkflowRepository = {
      find: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue(undefined),
    };
    workspaceWorkflowRepository = { update: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowCoreSyncService,
        {
          provide: getWorkspaceScopedRepositoryToken(WorkflowEntity),
          useValue: coreWorkflowRepository,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: WORKSPACE_ID,
              workspaceCustomApplicationId: APPLICATION_ID,
            }),
          },
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn((callback) => callback()),
            getRepository: jest
              .fn()
              .mockResolvedValue(workspaceWorkflowRepository),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockResolvedValue({
              flatFieldMetadataMaps: {
                byUniversalIdentifier: {
                  [STANDARD_OBJECTS.workflow.fields.coreWorkflowId
                    .universalIdentifier]: {},
                },
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WorkflowCoreSyncService>(WorkflowCoreSyncService);
  });

  it('honours a coreWorkflowId that resolves inside the workspace', async () => {
    coreWorkflowRepository.find.mockResolvedValue([
      { id: OWNED_CORE_WORKFLOW_ID },
    ]);

    await service.upsertToCore(WORKSPACE_ID, [
      buildWorkflow({ coreWorkflowId: OWNED_CORE_WORKFLOW_ID }),
    ]);

    expect(coreWorkflowRepository.upsert).toHaveBeenCalledWith(
      WORKSPACE_ID,
      [expect.objectContaining({ id: OWNED_CORE_WORKFLOW_ID })],
      ['id'],
    );
    expect(workspaceWorkflowRepository.update).not.toHaveBeenCalled();
  });

  // coreWorkflowId is writable through the record API, so a caller can point it
  // at a core row owned by another workspace.
  it('ignores a coreWorkflowId that belongs to another workspace', async () => {
    coreWorkflowRepository.find.mockResolvedValue([]);

    const workflow = buildWorkflow({
      coreWorkflowId: FOREIGN_CORE_WORKFLOW_ID,
    });

    await service.upsertToCore(WORKSPACE_ID, [workflow]);

    const [, coreRows] = coreWorkflowRepository.upsert.mock.calls[0];

    expect(coreRows[0].id).not.toBe(FOREIGN_CORE_WORKFLOW_ID);
    expect(workspaceWorkflowRepository.update).toHaveBeenCalledWith(
      workflow.id,
      { coreWorkflowId: coreRows[0].id },
    );
  });

  it('mints and writes back a core id for an unlinked workflow', async () => {
    const workflow = buildWorkflow({ coreWorkflowId: null });

    await service.upsertToCore(WORKSPACE_ID, [workflow]);

    expect(coreWorkflowRepository.find).not.toHaveBeenCalled();
    expect(workspaceWorkflowRepository.update).toHaveBeenCalledWith(
      workflow.id,
      { coreWorkflowId: expect.any(String) },
    );
  });
});
