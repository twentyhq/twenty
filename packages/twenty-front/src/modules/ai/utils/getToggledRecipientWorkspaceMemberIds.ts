export const getToggledRecipientWorkspaceMemberIds = ({
  recipientWorkspaceMemberIds,
  workspaceMemberId,
}: {
  recipientWorkspaceMemberIds: string[];
  workspaceMemberId: string;
}): string[] => {
  if (recipientWorkspaceMemberIds.includes(workspaceMemberId)) {
    return recipientWorkspaceMemberIds.filter(
      (recipientId) => recipientId !== workspaceMemberId,
    );
  }

  return [...recipientWorkspaceMemberIds, workspaceMemberId];
};
