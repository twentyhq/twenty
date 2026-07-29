export type Participant = {
  workspaceMemberId?: string | null;
  role?: string | null;
  isOrganizer?: boolean | null;
};

export const pickContactTeamMemberId = (
  participants: Participant[],
  prefer: { role: 'FROM' } | { isOrganizer: true },
): string | null => {
  const members = participants.filter((participant) =>
    Boolean(participant.workspaceMemberId),
  );

  if (members.length === 0) {
    return null;
  }

  const preferred = members.find((participant) =>
    'role' in prefer
      ? participant.role === prefer.role
      : participant.isOrganizer === true,
  );

  return (preferred ?? members[0]).workspaceMemberId ?? null;
};
