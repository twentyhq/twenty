import { type ApplicationWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { buildApplicationPlatformLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-platform-log-entry';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';

export const buildApplicationApiRateLimitedLogEntry = ({
  authContext,
  exhaustedScope,
}: {
  authContext: {
    workspace: Pick<ApplicationWorkspaceAuthContext['workspace'], 'id'>;
    application: Pick<
      ApplicationWorkspaceAuthContext['application'],
      'id' | 'applicationRegistrationId' | 'version'
    >;
  };
  exhaustedScope: Pick<ExhaustedScope, 'limitValue' | 'unit' | 'retryAfterMs'>;
}): ApplicationLogEntry =>
  buildApplicationPlatformLogEntry({
    workspaceId: authContext.workspace.id,
    applicationId: authContext.application.id,
    applicationRegistrationId:
      authContext.application.applicationRegistrationId ?? '',
    applicationVersion: authContext.application.version ?? '',
    source: 'API_RATE_LIMIT',
    level: 'WARN',
    message: `API rate limit reached. Requests are rejected for ${Math.ceil(exhaustedScope.retryAfterMs / 1_000)}s.`,
    errorCode: UsageLimitExceptionCode.RATE_LIMITED,
    properties: {
      limit: exhaustedScope.limitValue,
      unit: exhaustedScope.unit,
      retryAfterMs: exhaustedScope.retryAfterMs,
    },
  });
