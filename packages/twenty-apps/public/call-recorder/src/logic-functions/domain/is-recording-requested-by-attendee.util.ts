// A meeting whose attendees match no workspace member cannot be attributed to
// anyone, so it keeps recording and an opt-out only applies to attributable ones.
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
