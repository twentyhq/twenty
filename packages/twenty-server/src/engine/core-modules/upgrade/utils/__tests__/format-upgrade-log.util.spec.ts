import { formatUpgradeLog } from 'src/engine/core-modules/upgrade/utils/format-upgrade-log.util';

describe('formatUpgradeLog', () => {
  it('emits "[upgrade] <message> | event=<event>" with no fields', () => {
    expect(
      formatUpgradeLog({
        message: 'Upgrade for workspace abc-123 completed.',
        event: 'workspace.success',
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Upgrade for workspace abc-123 completed. | event=workspace.success"`,
    );
  });

  it('serializes numeric, boolean and string fields after the message', () => {
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
    ).toMatchInlineSnapshot(
      `"[upgrade] Upgrading workspace abc-123 1/10 | event=workspace.start workspaceId=abc-123 index=1 total=10 dryRun=false"`,
    );
  });

  it('emits null and undefined fields explicitly', () => {
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
    ).toMatchInlineSnapshot(
      `"[upgrade] migration-foo executed successfully | event=instance.success command=migration-foo error=undefined executedByVersion=null"`,
    );
  });

  it('quotes values containing whitespace, quotes or equals signs', () => {
    expect(
      formatUpgradeLog({
        message: 'Workspace abc failed on migrate-foo',
        event: 'workspace.failed',
        fields: {
          workspaceId: 'abc',
          error: 'Connection timed out',
        },
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Workspace abc failed on migrate-foo | event=workspace.failed workspaceId=abc error="Connection timed out""`,
    );
  });

  it('escapes embedded quotes and backslashes', () => {
    expect(
      formatUpgradeLog({
        message: 'Workspace abc failed',
        event: 'workspace.failed',
        fields: {
          error: 'bad "quote" and \\ backslash',
        },
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Workspace abc failed | event=workspace.failed error="bad \\"quote\\" and \\\\ backslash""`,
    );
  });

  it('keeps multi-line values on a single log line via \\n / \\r / \\t escaping', () => {
    expect(
      formatUpgradeLog({
        message: 'Workspace abc failed',
        event: 'workspace.failed',
        fields: {
          error: 'line one\nline two\rline three\ttab',
        },
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Workspace abc failed | event=workspace.failed error="line one\\nline two\\rline three\\ttab""`,
    );
  });

  it('escapes an event name containing whitespace or =', () => {
    expect(
      formatUpgradeLog({
        message: 'Something happened',
        event: 'weird event=with-equals',
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Something happened | event="weird event=with-equals""`,
    );
  });

  it('handles a realistic multi-line orchestrator validation error', () => {
    const error = `{
  "code": "METADATA_VALIDATION_FAILED",
  "errors": {
    "fieldMetadata": [
      {
        "errors": [
          { "code": "INVALID_FIELD_INPUT", "message": "Option id is required" },
          { "code": "INVALID_FIELD_INPUT", "message": "Option id is invalid", "value": null }
        ],
        "metadataName": "fieldMetadata",
        "status": "fail",
        "type": "update"
      }
    ]
  },
  "message": "Validation failed for 1 fieldMetadata",
  "summary": { "fieldMetadata": 1, "totalErrors": 1 }
}`;

    expect(
      formatUpgradeLog({
        message: 'Workspace abc failed on validate-field-metadata',
        event: 'workspace.failed',
        fields: {
          workspaceId: 'abc',
          command: 'validate-field-metadata',
          error,
        },
      }),
    ).toMatchInlineSnapshot(
      `"[upgrade] Workspace abc failed on validate-field-metadata | event=workspace.failed workspaceId=abc command=validate-field-metadata error="{\\n  \\"code\\": \\"METADATA_VALIDATION_FAILED\\",\\n  \\"errors\\": {\\n    \\"fieldMetadata\\": [\\n      {\\n        \\"errors\\": [\\n          { \\"code\\": \\"INVALID_FIELD_INPUT\\", \\"message\\": \\"Option id is required\\" },\\n          { \\"code\\": \\"INVALID_FIELD_INPUT\\", \\"message\\": \\"Option id is invalid\\", \\"value\\": null }\\n        ],\\n        \\"metadataName\\": \\"fieldMetadata\\",\\n        \\"status\\": \\"fail\\",\\n        \\"type\\": \\"update\\"\\n      }\\n    ]\\n  },\\n  \\"message\\": \\"Validation failed for 1 fieldMetadata\\",\\n  \\"summary\\": { \\"fieldMetadata\\": 1, \\"totalErrors\\": 1 }\\n}""`,
    );
  });
});
