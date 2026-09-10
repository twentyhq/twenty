import { type DataSource } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillWorkspaceWorkflowIdOnWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789036819010-backfill-workspace-workflow-id-on-workflows.command';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

const isUpdate = (sql: unknown) =>
  typeof sql === 'string' && sql.trimStart().startsWith('UPDATE');

const setup = ({
  total = 0,
  hasCoreWorkflowIdColumn = true,
}: {
  total?: number;
  hasCoreWorkflowIdColumn?: boolean;
} = {}) => {
  const query = jest.fn(async (...args: unknown[]) => {
    const sql = args[0] as string;

    if (sql.includes('information_schema.columns')) {
      return hasCoreWorkflowIdColumn ? [{ '?column?': 1 }] : [];
    }
    if (sql.includes('count(*)')) {
      return [{ total }];
    }

    return [];
  });

  const queryRunner = {
    connect: jest.fn(),
    release: jest.fn(),
    query,
  };

  const dataSource = {
    createQueryRunner: () => queryRunner,
  } as unknown as DataSource;

  const command = new BackfillWorkspaceWorkflowIdOnWorkflowsCommand(
    {} as WorkspaceIteratorService,
  );

  const run = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  return { run, query, queryRunner };
};

describe('BackfillWorkspaceWorkflowIdOnWorkflowsCommand', () => {
  beforeEach(() => jest.clearAllMocks());

  it('backfills the workspaces that have rows left to fill', async () => {
    const { run, query, queryRunner } = setup({ total: 3 });

    await run();

    const updateCalls = query.mock.calls.filter((call) => isUpdate(call[0]));

    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0][1]).toEqual([WORKSPACE_ID]);
    expect(queryRunner.connect).toHaveBeenCalledTimes(1);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('skips a workspace whose workflow table has no coreWorkflowId column', async () => {
    const { run, query, queryRunner } = setup({
      total: 3,
      hasCoreWorkflowIdColumn: false,
    });

    await run();

    expect(query.mock.calls.some((call) => isUpdate(call[0]))).toBe(false);
    expect(
      query.mock.calls.some((call) => String(call[0]).includes('count(*)')),
    ).toBe(false);
    expect(query).toHaveBeenCalledTimes(1);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('does not update on a dry run', async () => {
    const { run, query } = setup({ total: 3 });

    await run(true);

    expect(query.mock.calls.some((call) => isUpdate(call[0]))).toBe(false);
  });

  it('is a no-op when every row is already backfilled', async () => {
    const { run, query } = setup({ total: 0 });

    await run();

    expect(query.mock.calls.some((call) => isUpdate(call[0]))).toBe(false);
  });

  it('releases the query runner when the update throws', async () => {
    const { run, queryRunner, query } = setup({ total: 3 });

    query.mockImplementation(async (...args: unknown[]) => {
      const sql = args[0] as string;

      if (sql.includes('information_schema.columns')) {
        return [{ '?column?': 1 }];
      }
      if (sql.includes('count(*)')) {
        return [{ total: 3 }];
      }

      throw new Error('update failed');
    });

    await expect(run()).rejects.toThrow('update failed');

    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });
});
