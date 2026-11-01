import { type ApplicationWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { toLogfmt } from 'src/engine/utils/to-logfmt.util';

// The Twenty / Applications Grafana dashboard filters Loki on this message and
// reads app_name, universal_identifier and workspace_id with logfmt, so keep
// both stable
export const buildApplicationApiRateLimitedLogLine = ({
  authContext,
  exhaustedScope,
}: {
  authContext: ApplicationWorkspaceAuthContext;
  exhaustedScope: ExhaustedScope;
}): string =>
  `Application API rate limit exceeded ${toLogfmt({
    app_name: authContext.application.name,
    universal_identifier: authContext.application.universalIdentifier,
    application_id: authContext.application.id,
    workspace_id: authContext.workspace.id,
    limit: exhaustedScope.limitValue,
    unit: exhaustedScope.unit,
    retry_after_ms: exhaustedScope.retryAfterMs,
  })}`;
