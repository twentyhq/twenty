import { Test } from '@nestjs/testing';
import {
  type ActorMetadata,
  FieldActorSource,
  WorkflowVisibility,
} from 'twenty-shared/types';

import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const SOURCE_ID = 'source-workflow';
const SOURCE_VERSION_ID = 'source-version';
const CREATED_BY: ActorMetadata = {
  source: FieldActorSource.MANUAL,
  workspaceMemberId: null,
  name: 'User',
  context: {},
};
const INPUT = {
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: 'user-workspace-id',
  createdBy: CREATED_BY,
  coreWorkflowIdToDuplicate: SOURCE_ID,
  coreWorkflowVersionIdToCopy: SOURCE_VERSION_ID,
};
const COPY: CoreWorkflowDTO = {
  id: 'copy-workflow',
  name: 'App workflow (Duplicate)',
  statuses: [],
  applicationId: 'workspace-custom-application',
  workspaceWorkflowId: 'copy-mirror',
  lastPublishedVersionId: null,
  visibility: WorkflowVisibility.WORKSPACE,
  canChangeVisibility: true,
  createdAt: '',
  updatedAt: '',
};

describe('core workflow duplication', () => {
  const findWorkflow = jest.fn();
  const findVersion = jest.fn();
  const assertAccess = jest.fn();
  const writeContentAndMirror = jest.fn();
  let service: CoreWorkflowMutationWorkspaceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CoreWorkflowMutationWorkspaceService,
        {
          provide: getWorkspaceScopedRepositoryToken(WorkflowEntity),
          useValue: { findOne: findWorkflow },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(WorkflowVersionEntity),
          useValue: { findOne: findVersion },
        },
        {
          provide: CoreWorkflowAccessService,
          useValue: { assertCoreWorkflowsAreAccessibleOrThrow: assertAccess },
        },
        {
          provide: CoreWorkflowVersionWriteService,
          useValue: { writeContentAndMirror },
        },
        {
          provide: CoreWorkflowListService,
          useValue: { findOneById: jest.fn().mockResolvedValue(COPY) },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();
    service = module.get(CoreWorkflowMutationWorkspaceService);
    jest.spyOn(service, 'createWorkflow').mockResolvedValue(COPY);
    assertAccess.mockResolvedValue(undefined);
    findWorkflow.mockResolvedValue({
      id: SOURCE_ID,
      name: 'App workflow',
      applicationId: 'installed-app',
      workspaceWorkflowId: null,
      visibility: WorkflowVisibility.WORKSPACE,
    });
    findVersion.mockReset();
    findVersion
      .mockResolvedValueOnce({
        id: SOURCE_VERSION_ID,
        workspaceWorkflowVersionId: null,
        steps: [],
        triggers: [
          {
            type: 'MANUAL',
            name: 'Run',
            nextStepIds: [],
            settings: { outputSchema: {} },
          },
        ],
      })
      .mockResolvedValueOnce({ id: 'copy-version' });
  });

  it('copies an accessible app definition without requiring a source workspace mirror or edit access', async () => {
    await expect(service.duplicateWorkflow(INPUT)).resolves.toEqual(COPY);
    expect(service.createWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'App workflow (Duplicate)',
        visibility: WorkflowVisibility.WORKSPACE,
      }),
    );
    expect(findVersion).toHaveBeenNthCalledWith(1, WORKSPACE_ID, {
      where: { id: SOURCE_VERSION_ID, coreWorkflowId: SOURCE_ID },
    });
    expect(writeContentAndMirror).toHaveBeenCalledWith(
      expect.objectContaining({
        coreWorkflowVersionId: 'copy-version',
        steps: [],
      }),
    );
  });

  it('rejects inaccessible source workflows before reading or cloning their content', async () => {
    assertAccess.mockRejectedValueOnce(new Error('Workflow not found'));
    await expect(service.duplicateWorkflow(INPUT)).rejects.toThrow(
      'Workflow not found',
    );
    expect(findWorkflow).not.toHaveBeenCalled();
    expect(service.createWorkflow).not.toHaveBeenCalled();
  });

  it('rejects a version that does not belong to the source workflow', async () => {
    findVersion.mockReset().mockResolvedValue(null);
    await expect(service.duplicateWorkflow(INPUT)).rejects.toThrow(
      'to copy not found',
    );
    expect(service.createWorkflow).not.toHaveBeenCalled();
  });
});
