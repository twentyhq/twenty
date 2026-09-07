// Direct and queued installs and uninstalls of one application all execute
// under this key, so no entry path can overlap another
export const buildApplicationLifecycleLockKey = ({
  workspaceId,
  universalIdentifier,
}: {
  workspaceId: string;
  universalIdentifier: string;
}): string => `app-install:${workspaceId}:${universalIdentifier}`;
