import { Test } from '@nestjs/testing';

import { CoreWorkflowRunSummaryService } from 'src/engine/core-modules/workflow/services/core-workflow-run-summary.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const buildService = async ({
  rows = [],
  applyRowLevelPermissions = jest.fn().mockResolvedValue(undefined),
}: {
  rows?: Record<string, unknown>[];
  applyRowLevelPermissions?: jest.Mock;
} = {}) => {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    applyRowLevelPermissions,
    getQuery: jest.fn().mockReturnValue('SELECT ranked runs'),
    getParameters: jest.fn().mockReturnValue({ coreWorkflowIds: [] }),
  };
  const workflowRunRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    executeRaw: jest.fn().mockResolvedValue(rows),
  };
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback: () => unknown) => callback()),
    getRepository: jest.fn().mockReturnValue(workflowRunRepository),
  };

  const testingModule = await Test.createTestingModule({
    providers: [
      CoreWorkflowRunSummaryService,
      { provide: WorkspaceOrmManager, useValue: workspaceOrmManager },
    ],
  }).compile();

  return {
    service: testingModule.get(CoreWorkflowRunSummaryService),
    workflowRunRepository,
    workspaceOrmManager,
  };
};

describe('CoreWorkflowRunSummaryService', () => {
  it('skips the query when no workflow is requested', async () => {
    const { service, workspaceOrmManager } = await buildService();

    await expect(service.findManyByCoreWorkflowIds([])).resolves.toEqual([]);
    expect(
      workspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });

  it('returns a summary for every requested workflow, in request order', async () => {
    const recentRuns = [
      {
        id: 'run-2',
        status: 'FAILED',
        createdAt: '2026-11-10T10:00:00.000Z',
      },
      {
        id: 'run-1',
        status: 'COMPLETED',
        createdAt: '2026-11-09T10:00:00.000Z',
      },
    ];
    const { service } = await buildService({
      rows: [
        {
          coreWorkflowId: 'workflow-with-runs',
          runCount: '2',
          recentRuns,
        },
      ],
    });

    await expect(
      service.findManyByCoreWorkflowIds([
        'workflow-without-runs',
        'workflow-with-runs',
      ]),
    ).resolves.toEqual([
      {
        coreWorkflowId: 'workflow-without-runs',
        runCountLast14Days: 0,
        isRunCountLowerBound: false,
        recentRuns: [],
      },
      {
        coreWorkflowId: 'workflow-with-runs',
        runCountLast14Days: 2,
        isRunCountLowerBound: false,
        recentRuns,
      },
    ]);
  });

  it('flags a count that run retention may have truncated', async () => {
    const { service } = await buildService({
      rows: [
        { coreWorkflowId: 'busy-workflow', runCount: '1000', recentRuns: [] },
      ],
    });

    const [runSummary] = await service.findManyByCoreWorkflowIds([
      'busy-workflow',
    ]);

    expect(runSummary.isRunCountLowerBound).toBe(true);
  });

  it('applies the reader row level permissions before querying', async () => {
    const applyRowLevelPermissions = jest.fn().mockResolvedValue(undefined);
    const { service, workflowRunRepository } = await buildService({
      applyRowLevelPermissions,
    });

    await service.findManyByCoreWorkflowIds(['workflow-id']);

    expect(applyRowLevelPermissions).toHaveBeenCalled();
    expect(applyRowLevelPermissions.mock.invocationCallOrder[0]).toBeLessThan(
      workflowRunRepository.executeRaw.mock.invocationCallOrder[0],
    );
  });

  it('returns no summaries when the reader cannot read workflow runs', async () => {
    const { service, workflowRunRepository } = await buildService({
      applyRowLevelPermissions: jest
        .fn()
        .mockRejectedValue(
          new PermissionsException(
            'Permission denied',
            PermissionsExceptionCode.PERMISSION_DENIED,
          ),
        ),
    });

    await expect(
      service.findManyByCoreWorkflowIds(['workflow-id']),
    ).resolves.toEqual([]);
    expect(workflowRunRepository.executeRaw).not.toHaveBeenCalled();
  });
});
