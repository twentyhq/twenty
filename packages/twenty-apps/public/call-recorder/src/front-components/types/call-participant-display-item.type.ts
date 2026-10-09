type CallParticipantDisplayItemBase = {
  key: string;
  label: string;
  isOrganizer: boolean;
};

export type CallParticipantDisplayItem =
  | (CallParticipantDisplayItemBase & {
      kind: 'person';
      personId: string;
      avatarUrl?: string;
    })
  | (CallParticipantDisplayItemBase & {
      kind: 'workspaceMember';
      workspaceMemberId: string;
      avatarUrl?: string;
    })
  | (CallParticipantDisplayItemBase & {
      kind: 'unmatched';
    });
