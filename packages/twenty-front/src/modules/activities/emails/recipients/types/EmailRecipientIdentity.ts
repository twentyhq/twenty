export type EmailRecipientIdentity = {
  label: string;
  resolvedRecord?: {
    kind: 'person' | 'workspaceMember';
    id: string;
    avatarUrl?: string;
  };
};
