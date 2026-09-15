import { formatUpgradeLog } from 'src/engine/core-modules/upgrade/utils/format-upgrade-log.util';

describe('formatUpgradeLog', () => {
  it('emits humanMessage on its own lines followed by a single-line "[upgrade] event=<event>" tail', () => {
    expect(
      formatUpgradeLog({
        humanMessage: 'Upgrade for workspace abc-123 completed.',
        event: 'workspace.success',
      }),
    ).toMatchInlineSnapshot(`
"Upgrade for workspace abc-123 completed.
[upgrade] event=workspace.success"
`);
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
    ).toMatchInlineSnapshot(`
"Upgrading workspace abc-123 1/10
[upgrade] event=workspace.start workspaceId=abc-123 index=1 total=10 dryRun=false"
`);
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
    ).toMatchInlineSnapshot(`
"Upgrade summary: 42 workspace(s) succeeded, 1 workspace(s) failed
[upgrade] event=summary totalSuccesses=42 totalFailures=1 dryRun=false"
`);
  });

  it('preserves a multi-line humanMessage as-is and keeps the structured tail on its own single line', () => {
    const errorMessage =
      'Workspace migration runner failed:\n  - Option id is required\n  - Option id is invalid';

    expect(
      formatUpgradeLog({
        humanMessage: `Upgrade failed: ${errorMessage}`,
        event: 'aborted',
        logFields: {
          totalSuccesses: 41,
          totalFailures: 2,
          dryRun: false,
        },
      }),
    ).toMatchInlineSnapshot(`
"Upgrade failed: Workspace migration runner failed:
  - Option id is required
  - Option id is invalid
[upgrade] event=aborted totalSuccesses=41 totalFailures=2 dryRun=false"
`);
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
    ).toMatchInlineSnapshot(`
"migration-foo executed successfully
[upgrade] event=instance.success command=migration-foo error=undefined executedByVersion=null"
`);
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
    ).toMatchInlineSnapshot(`
"Workspace abc failed on migrate-foo: Connection timed out
[upgrade] event=workspace.failed workspaceId=abc command=migrate-foo"
`);
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
    ).toMatchInlineSnapshot(`
"Workspace abc failed
[upgrade] event=workspace.failed reason="bad \\"quote\\" and \\\\ backslash""
`);
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
    ).toMatchInlineSnapshot(`
"Workspace abc failed
[upgrade] event=workspace.failed reason="line one\\nline two\\rline three\\ttab""
`);
  });

  it('escapes an event name containing whitespace or =', () => {
    expect(
      formatUpgradeLog({
        humanMessage: 'Something happened',
        event: 'weird event=with-equals',
      }),
    ).toMatchInlineSnapshot(`
"Something happened
[upgrade] event="weird event=with-equals""
`);
  });
});
