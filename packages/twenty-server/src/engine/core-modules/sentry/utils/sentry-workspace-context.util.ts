import * as Sentry from '@sentry/node';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type WorkspaceSentryFields = {
  workspaceId: string;
  userWorkspaceId?: string;
};

// Apply Twenty workspace identifiers to the active Sentry isolation scope.
// Sets user, tags, and a `twenty` context block. The beforeSendSpan hook in
// instrument.ts reads this back and projects it onto every span as dotted
// attributes (twenty.workspace.id, twenty.user_workspace.id).
export const applyWorkspaceSentryContext = (
  authContext: WorkspaceAuthContext,
): void => {
  const fields = extractFieldsFromAuthContext(authContext);

  if (!fields) {
    return;
  }

  applyFields(fields);
};

// Apply Twenty workspace identifiers from a queue job's data payload. Used by
// the BullMQ/Sync drivers' work() wrapper. Most jobs carry a workspaceId on
// `job.data.workspaceId`; not all do. Skips silently when no workspaceId is
// available (system jobs, unauthenticated requests).
export const applyWorkspaceSentryContextFromJobData = (
  jobData: unknown,
): void => {
  const fields = extractFieldsFromJobData(jobData);

  if (!fields) {
    return;
  }

  applyFields(fields);
};

const applyFields = (fields: WorkspaceSentryFields): void => {
  // Primary identifier — userWorkspaceId when available, workspaceId as fallback
  Sentry.setUser({
    id: fields.userWorkspaceId ?? fields.workspaceId,
  });

  Sentry.setTag('twenty.workspace.id', fields.workspaceId);
  if (fields.userWorkspaceId) {
    Sentry.setTag('twenty.user_workspace.id', fields.userWorkspaceId);
  }

  // Source of truth read back by beforeSendSpan to project onto span data.
  Sentry.setContext('twenty', {
    workspace_id: fields.workspaceId,
    ...(fields.userWorkspaceId && {
      user_workspace_id: fields.userWorkspaceId,
    }),
  });
};

const extractFieldsFromAuthContext = (
  authContext: WorkspaceAuthContext,
): WorkspaceSentryFields | undefined => {
  const workspaceId = authContext.workspace?.id;

  if (!workspaceId) {
    return undefined;
  }

  switch (authContext.type) {
    case 'user':
    case 'pendingActivationUser':
      return {
        workspaceId,
        userWorkspaceId: authContext.userWorkspaceId,
      };
    case 'apiKey':
    case 'application':
    case 'system':
      return { workspaceId };
  }
};

const extractFieldsFromJobData = (
  jobData: unknown,
): WorkspaceSentryFields | undefined => {
  if (typeof jobData !== 'object' || jobData === null) {
    return undefined;
  }

  const workspaceId = (jobData as { workspaceId?: unknown }).workspaceId;
  const userWorkspaceId = (jobData as { userWorkspaceId?: unknown })
    .userWorkspaceId;

  if (typeof workspaceId !== 'string' || workspaceId.length === 0) {
    return undefined;
  }

  return {
    workspaceId,
    userWorkspaceId:
      typeof userWorkspaceId === 'string' && userWorkspaceId.length > 0
        ? userWorkspaceId
        : undefined,
  };
};
