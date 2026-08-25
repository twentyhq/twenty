type WorkspaceMemberName =
  | {
      firstName?: string | null;
      lastName?: string | null;
    }
  | null
  | undefined;

export const formatWorkspaceMemberName = (
  name: WorkspaceMemberName,
): string => {
  const firstName = name?.firstName?.trim() ?? '';
  const lastName = name?.lastName?.trim() ?? '';

  return [firstName, lastName].filter((part) => part.length > 0).join(' ');
};
