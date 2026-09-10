import { type DataSource } from 'typeorm';

import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillWorkspaceWorkflowIdOnWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789036819010-backfill-workspace-workflow-id-on-workflows.command';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

const isUpdate = (sql: unknown) =>
  typeof sql === 'string' && sql.trimStart().startsWith('UPDATE');

const setup = ({
  total = 0,
  objectMissing = false,
}: {
  total?: number;
  objectMissing?: boolean;
} = {}) => {
  const query = jest.fn(async (...args: unknown[]) => {
    const sql = args[0] as string;

    if (isUpdate(sql)) {
      return [];
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

  const count = objectMissing
    ? jest
        .fn()
        .mockRejectedValue(
          new TwentyOrmException(
            'Object "workflow" does not exist in this workspace',
            TwentyOrmExceptionCode.UNKNOWN_OBJECT,
          ),
        )
    : jest.fn().mockResolvedValue(0);

  const dataSource = {
    createQueryRunner: () => queryRunner,
  } as unknown as DataSource;

  const workspaceOrmManager = {
    executeInWorkspaceContext: (fn: () => Promise<unknown>) => fn(),
    getRepository: () => ({ count }),
  } as unknown as WorkspaceOrmManager;

  const command = new BackfillWorkspaceWorkflowIdOnWorkflowsCommand(
    {} as WorkspaceIteratorService,
    workspaceOrmManager,
  );

  const run = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: dataSource as never,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  return { run, query };
};

describe('BackfillWorkspaceWorkflowIdOnWorkflowsCommand', () => {
  beforeEach(() => jest.clearAllMocks());

  it('backfills only unset core rows that a workspace workflow points at', async () => {
    const { run, query } = setup({ total: 3 });

    await run();

    const updateCall = query.mock.calls.find((call) => isUpdate(call[0]));

    expect(updateCall?.[0]).toContain('SET "workspaceWorkflowId" =');
    expect(updateCall?.[0]).toContain('cw."workspaceWorkflowId" IS NULL');
    expect(updateCall?.[0]).toContain('w."coreWorkflowId" = cw.id');
    expect(updateCall?.[1]).toEqual([WORKSPACE_ID]);
  });

  it('picks a single deterministic workspace workflow when several point at the same core row', async () => {
    const { run, query } = setup({ total: 1 });

    await run();

    const updateCall = query.mock.calls.find((call) => isUpdate(call[0]));

    expect(updateCall?.[0]).toContain('ORDER BY w.id');
    expect(updateCall?.[0]).toContain('LIMIT 1');
  });

  it('does not filter out soft-deleted workspace workflows', async () => {
    const { run, query } = setup({ total: 1 });

    await run();

    const updateCall = query.mock.calls.find((call) => isUpdate(call[0]));

    expect(updateCall?.[0]).not.toContain('deletedAt');
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

  it('skips a workspace that never provisioned the workflow object', async () => {
    const { run, query } = setup({ total: 3, objectMissing: true });

    await run();

    expect(query).not.toHaveBeenCalled();
  });
});
