import { type DataSource } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillCoreVersionPointersCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789056077009-backfill-core-version-pointers.command';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

const isUpdate = (sql: unknown) =>
  typeof sql === 'string' && sql.trimStart().startsWith('UPDATE');

const updatedTable = (sql: string) =>
  sql.includes('core."workflow" cw') ? 'workflow' : 'commandMenuItem';

const setup = ({
  workflowTotal = 0,
  commandMenuItemTotal = 0,
  hasCoreWorkflowVersionIdColumn = true,
}: {
  workflowTotal?: number;
  commandMenuItemTotal?: number;
  hasCoreWorkflowVersionIdColumn?: boolean;
} = {}) => {
  const query = jest.fn(async (...args: unknown[]) => {
    const sql = args[0] as string;

    if (sql.includes('information_schema.columns')) {
      return hasCoreWorkflowVersionIdColumn ? [{ '?column?': 1 }] : [];
    }
    if (sql.includes('count(*)')) {
      return [
        {
          total: sql.includes('core."workflow" cw')
            ? workflowTotal
            : commandMenuItemTotal,
        },
      ];
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

  const command = new BackfillCoreVersionPointersCommand(
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

describe('BackfillCoreVersionPointersCommand', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates both tables when both have rows left to fill', async () => {
    const { run, query, queryRunner } = setup({
      workflowTotal: 2,
      commandMenuItemTotal: 3,
    });

    await run();

    const updated = query.mock.calls
      .filter((call) => isUpdate(call[0]))
      .map((call) => updatedTable(String(call[0])));

    expect(updated).toEqual(['workflow', 'commandMenuItem']);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('updates only the table that has rows left to fill', async () => {
    const { run, query } = setup({
      workflowTotal: 0,
      commandMenuItemTotal: 3,
    });

    await run();

    const updated = query.mock.calls
      .filter((call) => isUpdate(call[0]))
      .map((call) => updatedTable(String(call[0])));

    expect(updated).toEqual(['commandMenuItem']);
  });

  it('skips a workspace whose workflowVersion table has no coreWorkflowVersionId column', async () => {
    const { run, query, queryRunner } = setup({
      workflowTotal: 2,
      commandMenuItemTotal: 3,
      hasCoreWorkflowVersionIdColumn: false,
    });

    await run();

    expect(query).toHaveBeenCalledTimes(1);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('does not update on a dry run', async () => {
    const { run, query } = setup({
      workflowTotal: 2,
      commandMenuItemTotal: 3,
    });

    await run(true);

    expect(query.mock.calls.some((call) => isUpdate(call[0]))).toBe(false);
  });

  it('is a no-op when nothing is left to fill', async () => {
    const { run, query } = setup();

    await run();

    expect(query.mock.calls.some((call) => isUpdate(call[0]))).toBe(false);
  });

  it('releases the query runner when an update throws', async () => {
    const { run, queryRunner, query } = setup({ workflowTotal: 2 });

    query.mockImplementation(async (...args: unknown[]) => {
      const sql = args[0] as string;

      if (sql.includes('information_schema.columns')) {
        return [{ '?column?': 1 }];
      }
      if (sql.includes('count(*)')) {
        return [{ total: 2 }];
      }

      throw new Error('update failed');
    });

    await expect(run()).rejects.toThrow('update failed');

    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });
});
