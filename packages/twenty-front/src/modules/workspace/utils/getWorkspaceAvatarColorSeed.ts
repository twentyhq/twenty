export const getWorkspaceAvatarColorSeed = (
  workspaceDisplayName: string | null | undefined,
): string => (workspaceDisplayName ?? '').trim().charAt(0).toUpperCase();
