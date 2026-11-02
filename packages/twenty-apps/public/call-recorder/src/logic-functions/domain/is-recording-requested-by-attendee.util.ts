export const isRecordingRequestedByAttendee = ({
  participantWorkspaceMemberIds,
  optedInWorkspaceMemberIds,
}: {
  participantWorkspaceMemberIds: string[];
  optedInWorkspaceMemberIds: Set<string>;
}): boolean =>
  participantWorkspaceMemberIds.length === 0 ||
  participantWorkspaceMemberIds.some((workspaceMemberId) =>
    optedInWorkspaceMemberIds.has(workspaceMemberId),
  );
