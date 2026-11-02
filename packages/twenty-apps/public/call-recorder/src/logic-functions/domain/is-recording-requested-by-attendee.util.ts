// A meeting whose attendees match no workspace member keeps recording, so an opt-out only applies to attributable meetings.
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
