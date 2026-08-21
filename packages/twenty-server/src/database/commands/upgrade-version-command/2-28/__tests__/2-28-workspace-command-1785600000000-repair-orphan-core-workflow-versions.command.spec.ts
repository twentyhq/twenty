import { type DataSource, type QueryRunner } from 'typeorm';
import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RepairOrphanCoreWorkflowVersionsCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785600000000-repair-orphan-core-workflow-versions.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

const isDelete = (sql: unknown) =>
  typeof sql === 'string' && sql.trimStart().startsWith('DELETE');

const setup = ({
  total = 0,
  active = 0,
  objectMissing = false,
  deleteFails = false,
}: {
  total?: number;
  active?: number;
  objectMissing?: boolean;
  deleteFails?: boolean;
} = {}) => {
  const query = jest.fn(async (...args: unknown[]) => {
    const sql = args[0] as string;

    if (isDelete(sql)) {
      if (deleteFails) throw new Error('boom');

      return [];
    }
    if (sql.includes('count(*)')) {
      return [{ total, active }];
    }

    return [];
  });

  const startTransaction = jest.fn();
  const commitTransaction = jest.fn();
  const rollbackTransaction = jest.fn();
  const queryRunner = {
    connect: jest.fn(),
    startTransaction,
    commitTransaction,
    rollbackTransaction,
    release: jest.fn(),
    query,
  } as unknown as QueryRunner;

  const count = objectMissing
    ? jest
        .fn()
        .mockRejectedValue(new EntityMetadataNotFoundError('workflowVersion'))
    : jest.fn().mockResolvedValue(0);

  const dataSource = {
    getRepository: () => ({ count }),
    createQueryRunner: () => queryRunner,
  } as unknown as DataSource;

  const recompute = jest.fn();
  const command = new RepairOrphanCoreWorkflowVersionsCommand(
    {} as WorkspaceIteratorService,
    { invalidateAndRecompute: recompute } as unknown as WorkspaceCacheService,
  );

  const run = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: dataSource as never,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  return { run, query, startTransaction, rollbackTransaction, recompute };
};

describe('RepairOrphanCoreWorkflowVersionsCommand', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deletes orphans with an atomic NOT EXISTS and recomputes the trigger map', async () => {
    const { run, query, recompute } = setup({ total: 2, active: 1 });

    await run();

    const deleteCall = query.mock.calls.find((call) => isDelete(call[0]));

    expect(deleteCall?.[0]).toContain('NOT EXISTS');
    expect(deleteCall?.[0]).toContain('coreWorkflowVersionId');
    expect(deleteCall?.[1]).toEqual([WORKSPACE_ID]);
    expect(recompute).toHaveBeenCalledWith(WORKSPACE_ID, [
      'workflowAutomatedTriggerMaps',
    ]);
  });

  it('does not delete or recompute on a dry run', async () => {
    const { run, query, startTransaction, recompute } = setup({
      total: 2,
      active: 1,
    });

    await run(true);

    expect(query.mock.calls.some((call) => isDelete(call[0]))).toBe(false);
    expect(startTransaction).not.toHaveBeenCalled();
    expect(recompute).not.toHaveBeenCalled();
  });

  it('is a no-op when there are no orphans', async () => {
    const { run, query, recompute } = setup({ total: 0 });

    await run();

    expect(query.mock.calls.some((call) => isDelete(call[0]))).toBe(false);
    expect(recompute).not.toHaveBeenCalled();
  });

  it('does not recompute when only non-active orphans are removed', async () => {
    const { run, query, recompute } = setup({ total: 2, active: 0 });

    await run();

    expect(query.mock.calls.some((call) => isDelete(call[0]))).toBe(true);
    expect(recompute).not.toHaveBeenCalled();
  });

  it('rolls back and does not recompute when the delete fails', async () => {
    const { run, rollbackTransaction, recompute } = setup({
      total: 2,
      active: 1,
      deleteFails: true,
    });

    await expect(run()).rejects.toThrow('boom');

    expect(rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(recompute).not.toHaveBeenCalled();
  });

  it('skips a workspace that never provisioned the workflowVersion object', async () => {
    const { run, query, recompute } = setup({ total: 2, objectMissing: true });

    await run();

    expect(query.mock.calls.some((call) => isDelete(call[0]))).toBe(false);
    expect(recompute).not.toHaveBeenCalled();
  });
});
