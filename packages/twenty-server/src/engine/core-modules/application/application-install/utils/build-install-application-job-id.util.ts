// The id must be derivable from the application alone so a client that lost its
// mutation result can still read the install status back, and BullMQ job ids are
// queue-global so the workspace has to be part of it
export const buildInstallApplicationJobId = ({
  workspaceId,
  universalIdentifier,
}: {
  workspaceId: string;
  universalIdentifier: string;
}): string => `install-application.${workspaceId}.${universalIdentifier}`;
