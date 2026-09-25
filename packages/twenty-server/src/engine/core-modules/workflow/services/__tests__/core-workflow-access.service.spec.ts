import { Test } from '@nestjs/testing';
import { WorkflowVisibility } from 'twenty-shared/types';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKFLOW_ID = 'workflow';
const ARGS = {
  workspaceId: 'workspace',
  userWorkspaceId: 'user',
  coreWorkflowIds: [WORKFLOW_ID],
};

describe('application workflow editing', () => {
  let service: CoreWorkflowAccessService;
  const find = jest.fn();

  beforeEach(async () => {
    find.mockReset();
    const module = await Test.createTestingModule({
      providers: [
        CoreWorkflowAccessService,
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
              .fn()
              .mockResolvedValue({
                workspaceCustomFlatApplication: { id: 'custom' },
                twentyStandardFlatApplication: { id: 'standard' },
              }),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(WorkflowEntity),
          useValue: { find },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(WorkflowVersionEntity),
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();
    service = module.get(CoreWorkflowAccessService);
  });

  it.each(['custom', 'standard'])(
    'keeps %s workflows editable',
    async (applicationId) => {
      find.mockResolvedValue([
        {
          id: WORKFLOW_ID,
          applicationId,
          visibility: WorkflowVisibility.WORKSPACE,
        },
      ]);
      await expect(
        service.assertCoreWorkflowsAreEditableOrThrow(ARGS),
      ).resolves.toBeUndefined();
    },
  );

  it('allows reading an app workflow but refuses a batch containing one app-owned workflow', async () => {
    find.mockResolvedValue([
      {
        id: WORKFLOW_ID,
        applicationId: 'installed-app',
        visibility: WorkflowVisibility.WORKSPACE,
      },
    ]);
    await expect(
      service.assertCoreWorkflowsAreAccessibleOrThrow(ARGS),
    ).resolves.toBeUndefined();
    await expect(
      service.assertCoreWorkflowsAreEditableOrThrow({
        ...ARGS,
        coreWorkflowIds: [WORKFLOW_ID, 'custom-workflow'],
      }),
    ).rejects.toThrow('Application workflows can only be changed');
  });

  it('preserves private workflow restrictions', async () => {
    find.mockResolvedValue([
      {
        id: WORKFLOW_ID,
        applicationId: 'custom',
        visibility: WorkflowVisibility.PRIVATE,
        createdByUserWorkspaceId: 'someone-else',
      },
    ]);
    await expect(
      service.assertCoreWorkflowsAreEditableOrThrow(ARGS),
    ).rejects.toThrow('private to another member');
  });

  it('keeps empty batches a no-op', async () => {
    await service.assertCoreWorkflowsAreEditableOrThrow({
      ...ARGS,
      coreWorkflowIds: [],
    });
    expect(find).not.toHaveBeenCalled();
  });
});
