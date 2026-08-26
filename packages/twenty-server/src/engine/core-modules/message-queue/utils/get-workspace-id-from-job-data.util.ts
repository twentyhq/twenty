import { isNonEmptyString } from '@sniptt/guards';

export const getWorkspaceIdFromJobData = (
  jobData: unknown,
): string | undefined => {
  if (typeof jobData !== 'object' || jobData === null) {
    return undefined;
  }

  const workspaceId = (jobData as { workspaceId?: unknown }).workspaceId;

  return isNonEmptyString(workspaceId) ? workspaceId : undefined;
};
