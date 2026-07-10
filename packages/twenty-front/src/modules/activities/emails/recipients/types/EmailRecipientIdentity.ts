export type EmailRecipientIdentity =
  | {
      kind: 'person' | 'workspaceMember';
      label: string;
      resolvedRecord: { id: string; avatarUrl?: string };
    }
  | {
      kind: 'unknown';
      label: string;
    };
