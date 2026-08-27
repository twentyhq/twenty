import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

// Deliberately blind to an application carried by a user context: the throttler
// this replaces only metered requests the application made in its own name, and
// widening it would charge agent runs to the application's cross-workspace budget.
export const getApplicationUniversalIdentifier = (
  authContext: WorkspaceAuthContext,
): string | null =>
  isApplicationAuthContext(authContext)
    ? (authContext.application.universalIdentifier ?? null)
    : null;
