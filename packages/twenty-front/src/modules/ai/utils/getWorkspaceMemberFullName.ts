type WorkspaceMemberWithName = {
  name: { firstName: string; lastName: string };
  userEmail?: string;
};

export const getWorkspaceMemberFullName = (
  workspaceMember: WorkspaceMemberWithName,
): string => {
  const fullName =
    `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim();

  return fullName.length > 0 ? fullName : (workspaceMember.userEmail ?? '');
};
