export type RecordSharingInvitationRecipient = {
  id: string;
  label: string;
} & (
  | { kind: 'workspaceMember'; avatarUrl?: string | null }
  | { kind: 'role' }
  | { kind: 'everyone' }
);
