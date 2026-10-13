import { buildApplicationApiRateLimitedLogLine } from 'src/engine/api/common/common-query-runners/utils/build-application-api-rate-limited-log-line.util';
import { type ApplicationWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const authContext = {
  type: 'application',
  workspace: { id: '00000000-0000-4000-8000-000000000010' },
  application: {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Call Recorder',
    universalIdentifier: '8da4b8b5-5edf-4880-b51f-ab6e679ec617',
  },
} as unknown as ApplicationWorkspaceAuthContext;

const exhaustedScope = {
  limitValue: 500,
  unit: UsageUnit.COMPLEXITY,
  retryAfterMs: 1200,
} as ExhaustedScope;

describe('buildApplicationApiRateLimitedLogLine', () => {
  it('logs the app and the workspace it was throttled in as logfmt', () => {
    expect(
      buildApplicationApiRateLimitedLogLine({ authContext, exhaustedScope }),
    ).toBe(
      'Application API rate limit exceeded app_name="Call Recorder" universal_identifier=8da4b8b5-5edf-4880-b51f-ab6e679ec617 application_id=00000000-0000-4000-8000-000000000001 workspace_id=00000000-0000-4000-8000-000000000010 limit=500 unit=COMPLEXITY retry_after_ms=1200',
    );
  });

  it('escapes quotes in app names and leaves out a missing unit', () => {
    const logLine = buildApplicationApiRateLimitedLogLine({
      authContext: {
        ...authContext,
        application: { ...authContext.application, name: 'The "best" app' },
      },
      exhaustedScope: { ...exhaustedScope, unit: undefined },
    });

    expect(logLine).toContain('app_name="The \\"best\\" app" ');
    expect(logLine).not.toContain('unit=');
  });

  it('keeps an app name with line breaks on a single log line', () => {
    const logLine = buildApplicationApiRateLimitedLogLine({
      authContext: {
        ...authContext,
        application: {
          ...authContext.application,
          name: 'Evil\nApplication API rate limit exceeded workspace_id=forged\r',
        },
      },
      exhaustedScope,
    });

    expect(logLine).not.toMatch(/[\n\r]/);
    expect(logLine).toContain(
      'app_name="Evil\\nApplication API rate limit exceeded workspace_id=forged\\r" ',
    );
  });
});
