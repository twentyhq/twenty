import { formatUpgradeLog } from 'src/engine/core-modules/upgrade/utils/format-upgrade-log.util';

describe('formatUpgradeLog', () => {
  it('emits "[upgrade] <humanMessage> | event=<event>" with no logFields', () => {
    expect(
      formatUpgradeLog({
        humanMessage: 'Upgrade for workspace abc-123 completed.',
        event: 'workspace.success',
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Upgrade for workspace abc-123 completed. | event=workspace.success"`,
    );
  });

  it('serializes numeric, boolean and string logFields after the humanMessage', () => {
    expect(
      formatUpgradeLog({
        humanMessage: 'Upgrading workspace abc-123 1/10',
        event: 'workspace.start',
        logFields: {
          workspaceId: 'abc-123',
          index: 1,
          total: 10,
          dryRun: false,
        },
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Upgrading workspace abc-123 1/10 | event=workspace.start workspaceId=abc-123 index=1 total=10 dryRun=false"`,
    );
  });

  it('matches the summary call site emitted by UpgradeCommand at the end of a run', () => {
    expect(
      formatUpgradeLog({
        humanMessage:
          'Upgrade summary: 42 workspace(s) succeeded, 1 workspace(s) failed',
        event: 'summary',
        logFields: {
          totalSuccesses: 42,
          totalFailures: 1,
          dryRun: false,
        },
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Upgrade summary: 42 workspace(s) succeeded, 1 workspace(s) failed | event=summary totalSuccesses=42 totalFailures=1 dryRun=false"`,
    );
  });

  it('emits null and undefined logFields explicitly', () => {
    expect(
      formatUpgradeLog({
        humanMessage: 'migration-foo executed successfully',
        event: 'instance.success',
        logFields: {
          command: 'migration-foo',
          error: undefined,
          executedByVersion: null,
        },
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] migration-foo executed successfully | event=instance.success command=migration-foo error=undefined executedByVersion=null"`,
    );
  });

  it('quotes values containing whitespace, quotes or equals signs', () => {
    expect(
      formatUpgradeLog({
        humanMessage:
          'Workspace abc failed on migrate-foo: Connection timed out',
        event: 'workspace.failed',
        logFields: {
          workspaceId: 'abc',
          command: 'migrate-foo',
        },
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Workspace abc failed on migrate-foo: Connection timed out | event=workspace.failed workspaceId=abc command=migrate-foo"`,
    );
  });

  it('escapes embedded quotes and backslashes in logField values', () => {
    expect(
      formatUpgradeLog({
        humanMessage: 'Workspace abc failed',
        event: 'workspace.failed',
        logFields: {
          reason: 'bad "quote" and \\ backslash',
        },
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Workspace abc failed | event=workspace.failed reason="bad \\"quote\\" and \\\\ backslash""`,
    );
  });

  it('keeps multi-line logField values on a single log line via \\n / \\r / \\t escaping', () => {
    expect(
      formatUpgradeLog({
        humanMessage: 'Workspace abc failed',
        event: 'workspace.failed',
        logFields: {
          reason: 'line one\nline two\rline three\ttab',
        },
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Workspace abc failed | event=workspace.failed reason="line one\\nline two\\rline three\\ttab""`,
    );
  });

  it('escapes an event name containing whitespace or =', () => {
    expect(
      formatUpgradeLog({
        humanMessage: 'Something happened',
        event: 'weird event=with-equals',
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Something happened | event="weird event=with-equals""`,
    );
  });
});
