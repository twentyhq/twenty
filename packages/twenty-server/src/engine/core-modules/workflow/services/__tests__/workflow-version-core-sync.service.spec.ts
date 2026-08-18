import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const APPLICATION_ID = '20202020-0000-4000-8000-000000000002';
const OWNED_CORE_VERSION_ID = '20202020-0000-4000-8000-000000000003';
const FOREIGN_CORE_VERSION_ID = '20202020-0000-4000-8000-000000000004';

const buildWorkflowVersion = (
  overrides: Partial<WorkflowVersionWorkspaceEntity>,
): WorkflowVersionWorkspaceEntity =>
  ({
    id: '20202020-0000-4000-8000-00000000000a',
    workflowId: '20202020-0000-4000-8000-00000000000b',
    trigger: null,
    steps: null,
    status: 'DRAFT',
    coreWorkflowVersionId: null,
    ...overrides,
  }) as unknown as WorkflowVersionWorkspaceEntity;

describe('WorkflowVersionCoreSyncService', () => {
  let service: WorkflowVersionCoreSyncService;
  let coreWorkflowVersionRepository: { find: jest.Mock; upsert: jest.Mock };
  let workspaceWorkflowVersionRepository: { update: jest.Mock };

  beforeEach(async () => {
    coreWorkflowVersionRepository = {
      find: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue(undefined),
    };
    workspaceWorkflowVersionRepository = { update: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowVersionCoreSyncService,
        {
          provide: getWorkspaceScopedRepositoryToken(WorkflowVersionEntity),
          useValue: coreWorkflowVersionRepository,
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
              .mockResolvedValue(workspaceWorkflowVersionRepository),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            invalidateAndRecompute: jest.fn(),
            getOrRecompute: jest.fn().mockResolvedValue({
              flatFieldMetadataMaps: {
                byUniversalIdentifier: {
                  [STANDARD_OBJECTS.workflowVersion.fields.coreWorkflowVersionId
                    .universalIdentifier]: {},
                },
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WorkflowVersionCoreSyncService>(
      WorkflowVersionCoreSyncService,
    );
  });

  it('honours a coreWorkflowVersionId that resolves inside the workspace', async () => {
    coreWorkflowVersionRepository.find.mockResolvedValue([
      { id: OWNED_CORE_VERSION_ID },
    ]);

    await service.upsertToCore(WORKSPACE_ID, [
      buildWorkflowVersion({ coreWorkflowVersionId: OWNED_CORE_VERSION_ID }),
    ]);

    expect(coreWorkflowVersionRepository.upsert).toHaveBeenCalledWith(
      WORKSPACE_ID,
      [expect.objectContaining({ id: OWNED_CORE_VERSION_ID })],
      ['id'],
    );
    expect(workspaceWorkflowVersionRepository.update).not.toHaveBeenCalled();
  });

  // coreWorkflowVersionId is writable through the record API, so a caller can
  // point it at a core row owned by another workspace.
  it('ignores a coreWorkflowVersionId that belongs to another workspace', async () => {
    coreWorkflowVersionRepository.find.mockResolvedValue([]);

    const workflowVersion = buildWorkflowVersion({
      coreWorkflowVersionId: FOREIGN_CORE_VERSION_ID,
    });

    await service.upsertToCore(WORKSPACE_ID, [workflowVersion]);

    const [, coreRows] = coreWorkflowVersionRepository.upsert.mock.calls[0];

    expect(coreRows[0].id).not.toBe(FOREIGN_CORE_VERSION_ID);
    expect(workspaceWorkflowVersionRepository.update).toHaveBeenCalledWith(
      workflowVersion.id,
      { coreWorkflowVersionId: coreRows[0].id },
    );
  });
});
