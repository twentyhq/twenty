export const buildApplicationLifecycleLockKey = ({
  workspaceId,
  universalIdentifier,
}: {
  workspaceId: string;
  universalIdentifier: string;
}): string => `application-lifecycle:${workspaceId}:${universalIdentifier}`;
