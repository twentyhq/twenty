type EmailParticipantAvatarColorSeedInput = {
  personId?: string | null;
  workspaceMemberId?: string | null;
  person?: { id: string } | null;
  workspaceMember?: { id: string } | null;
  handle?: string | null;
  displayName?: string | null;
};

export const getEmailParticipantAvatarColorSeed = (
  participant: EmailParticipantAvatarColorSeedInput,
) =>
  participant.personId ||
  participant.person?.id ||
  participant.workspaceMemberId ||
  participant.workspaceMember?.id ||
  participant.handle?.trim().toLowerCase() ||
  participant.displayName ||
  '';
