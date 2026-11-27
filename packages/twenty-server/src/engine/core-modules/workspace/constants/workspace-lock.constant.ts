export const WORKSPACE_LOCK_OPTIONS = {
  ms: 500,
  maxRetries: 240,
};

export const buildWorkspaceLockKey = (workspaceId: string): string =>
  `workspace:${workspaceId}`;
