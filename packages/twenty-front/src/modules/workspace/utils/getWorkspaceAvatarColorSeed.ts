export const getWorkspaceAvatarColorSeed = (
  workspaceDisplayName: string | null | undefined,
): string => {
  return (workspaceDisplayName ?? '').trim().charAt(0).toUpperCase();
};
