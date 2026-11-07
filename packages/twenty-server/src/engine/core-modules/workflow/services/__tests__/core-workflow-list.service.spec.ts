import { getDataSourceToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';

import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { type WorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const WORKFLOW_ID = '20202020-0000-4000-8000-000000000001';
const VERSION_ID = '20202020-0000-4000-8000-000000000002';

const storedCodeStep: WorkflowCodeAction = {
  id: 'code-step',
  name: 'Code',
  type: WorkflowActionType.CODE,
  valid: true,
  settings: {
    input: { logicFunctionInput: {} },
    outputSchema: {},
    expectedOutputSchema: { total: 3 },
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

describe('CoreWorkflowListService', () => {
  it('returns the current version of each workflow with computed output schemas', async () => {
    const createdAt = new Date('2026-11-01T00:00:00Z');
    const workflow = Object.assign(new WorkflowEntity(), {
      id: WORKFLOW_ID,
      name: 'Workflow',
      createdAt,
      updatedAt: createdAt,
    });
    const version = Object.assign(new WorkflowVersionEntity(), {
      id: VERSION_ID,
      coreWorkflowId: WORKFLOW_ID,
      status: WorkflowVersionStatus.DRAFT,
      createdAt,
      updatedAt: createdAt,
    });
    const versionContent = Object.assign(new WorkflowVersionEntity(), {
      id: VERSION_ID,
      triggers: null,
      steps: [storedCodeStep],
    });

    const testingModule = await Test.createTestingModule({
      providers: [
        CoreWorkflowListService,
        WorkflowSchemaWorkspaceService,
        { provide: getDataSourceToken(), useValue: {} },
        {
          provide: getWorkspaceScopedRepositoryToken(WorkflowEntity),
          useValue: { find: jest.fn().mockResolvedValue([workflow]) },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(WorkflowVersionEntity),
          useValue: {
            find: jest
              .fn()
              .mockResolvedValueOnce([version])
              .mockResolvedValueOnce([versionContent]),
          },
        },
        { provide: WorkflowCommonWorkspaceService, useValue: {} },
        { provide: WorkspaceManyOrAllFlatEntityMapsCacheService, useValue: {} },
      ],
    }).compile();

    const [{ currentVersion }] = await testingModule
      .get(CoreWorkflowListService)
      .findManyWithCurrentVersions({
        workspaceId: 'workspace-id',
        userWorkspaceId: undefined,
        callerApplication: undefined,
        workspaceCustomApplicationId: undefined,
        coreWorkflowIds: [WORKFLOW_ID],
      });

    expect(currentVersion.steps?.[0].settings.outputSchema).toEqual({
      total: { isLeaf: true, type: 'number', label: 'total', value: 3 },
    });
  });
});
