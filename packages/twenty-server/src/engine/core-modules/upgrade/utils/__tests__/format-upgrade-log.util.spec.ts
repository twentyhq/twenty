import { formatUpgradeLog } from 'src/engine/core-modules/upgrade/utils/format-upgrade-log.util';

describe('formatUpgradeLog', () => {
  it('should emit "[upgrade] <message> | event=<event>" with no fields', () => {
    expect(
      formatUpgradeLog({
        message: 'Upgrade for workspace abc-123 completed.',
        event: 'workspace.success',
      }),
    ).toBe(
      '[upgrade] Upgrade for workspace abc-123 completed. | event=workspace.success',
    );
  });

  it('should serialize numeric, boolean and string fields after the message', () => {
    expect(
      formatUpgradeLog({
        message: 'Upgrading workspace abc-123 1/10',
        event: 'workspace.start',
        fields: {
          workspaceId: 'abc-123',
          index: 1,
          total: 10,
          dryRun: false,
        },
      }),
    ).toBe(
      '[upgrade] Upgrading workspace abc-123 1/10 | event=workspace.start workspaceId=abc-123 index=1 total=10 dryRun=false',
    );
  });

  it('should skip undefined and null fields via isDefined', () => {
    expect(
      formatUpgradeLog({
        message: 'migration-foo executed successfully',
        event: 'instance.success',
        fields: {
          command: 'migration-foo',
          error: undefined,
          executedByVersion: null,
        },
      }),
    ).toBe(
      '[upgrade] migration-foo executed successfully | event=instance.success command=migration-foo',
    );
  });

  it('should quote values containing whitespace, quotes or equals signs', () => {
    expect(
      formatUpgradeLog({
        message: 'Workspace abc failed on migrate-foo',
        event: 'workspace.failed',
        fields: {
          workspaceId: 'abc',
          error: 'Connection timed out',
        },
      }),
    ).toBe(
      '[upgrade] Workspace abc failed on migrate-foo | event=workspace.failed workspaceId=abc error="Connection timed out"',
    );
  });

  it('should escape embedded quotes and backslashes', () => {
    expect(
      formatUpgradeLog({
        message: 'Workspace abc failed',
        event: 'workspace.failed',
        fields: {
          error: 'bad "quote" and \\ backslash',
        },
      }),
    ).toBe(
      '[upgrade] Workspace abc failed | event=workspace.failed error="bad \\"quote\\" and \\\\ backslash"',
    );
  });
});
