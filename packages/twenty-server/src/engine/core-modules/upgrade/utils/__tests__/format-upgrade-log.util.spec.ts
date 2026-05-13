import { formatUpgradeLog } from 'src/engine/core-modules/upgrade/utils/format-upgrade-log.util';

describe('formatUpgradeLog', () => {
  it('should emit the [upgrade] prefix and event tag', () => {
    expect(formatUpgradeLog('workspace.success')).toBe(
      '[upgrade] event=workspace.success',
    );
  });

  it('should serialize numeric, boolean and string fields', () => {
    expect(
      formatUpgradeLog('workspace.start', {
        workspaceId: 'abc-123',
        index: 1,
        total: 10,
        dryRun: false,
      }),
    ).toBe(
      '[upgrade] event=workspace.start workspaceId=abc-123 index=1 total=10 dryRun=false',
    );
  });

  it('should skip undefined and null fields', () => {
    expect(
      formatUpgradeLog('instance.success', {
        command: 'foo',
        error: undefined,
        executedByVersion: null,
      }),
    ).toBe('[upgrade] event=instance.success command=foo');
  });

  it('should quote values containing whitespace, quotes or equals signs', () => {
    expect(
      formatUpgradeLog('workspace.failed', {
        workspaceId: 'abc',
        error: 'Connection timed out',
      }),
    ).toBe(
      '[upgrade] event=workspace.failed workspaceId=abc error="Connection timed out"',
    );
  });

  it('should escape embedded quotes and backslashes', () => {
    expect(
      formatUpgradeLog('workspace.failed', {
        error: 'bad "quote" and \\ backslash',
      }),
    ).toBe(
      '[upgrade] event=workspace.failed error="bad \\"quote\\" and \\\\ backslash"',
    );
  });
});
