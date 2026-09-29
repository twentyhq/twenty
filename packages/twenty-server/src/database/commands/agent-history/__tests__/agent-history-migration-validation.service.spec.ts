import { AgentHistoryMigrationValidationService } from 'src/database/commands/agent-history/agent-history-migration-validation.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const buildRunner = ({
  tableExists,
  liveTargetIds,
}: {
  tableExists: boolean;
  liveTargetIds: string[];
}) => ({
  query: jest.fn().mockImplementation(async (sql: string) => {
    if (sql.includes('to_regclass')) {
      return [{ exists: tableExists }];
    }

    return liveTargetIds.map((id) => ({ id }));
  }),
});

describe('Rolling agent history back to core', () => {
  const service = new AgentHistoryMigrationValidationService();

  it('refuses while records are still linked to chat threads', async () => {
    const runner = buildRunner({
      tableExists: true,
      liveTargetIds: ['20202020-0000-4000-8000-000000000002'],
    });

    await expect(
      service.assertNoThreadTargets({
        runner: runner as never,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toThrow(/Detach them before rolling agent history back to core/);
  });

  it('allows the rollback once every link is detached', async () => {
    const runner = buildRunner({ tableExists: true, liveTargetIds: [] });

    await expect(
      service.assertNoThreadTargets({
        runner: runner as never,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBeUndefined();
  });

  // A workspace that never got the target object cannot have links, and must
  // not be blocked by a query against a table that does not exist.
  it('allows the rollback in a workspace that has no target table', async () => {
    const runner = buildRunner({ tableExists: false, liveTargetIds: [] });

    await expect(
      service.assertNoThreadTargets({
        runner: runner as never,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBeUndefined();

    expect(runner.query).toHaveBeenCalledTimes(1);
  });
});
