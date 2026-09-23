// Seeding by the initial keeps the color stable while the name is typed or edited
export const getWorkspaceAvatarColorSeed = (
  workspaceDisplayName: string | null | undefined,
): string => (workspaceDisplayName ?? '').trim().charAt(0).toUpperCase();
