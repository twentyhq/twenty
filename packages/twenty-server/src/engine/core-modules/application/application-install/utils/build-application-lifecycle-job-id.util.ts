export type ApplicationLifecycleOperation = 'install' | 'uninstall';

// The id must be derivable from the application alone so a client that lost its
// mutation result can still find the job, and BullMQ job ids are queue-global so
// the workspace has to be part of it
export const buildApplicationLifecycleJobId = ({
  operation,
  workspaceId,
  universalIdentifier,
}: {
  operation: ApplicationLifecycleOperation;
  workspaceId: string;
  universalIdentifier: string;
}): string => `${operation}-application.${workspaceId}.${universalIdentifier}`;
