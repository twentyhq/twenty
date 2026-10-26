export type RecordPermissionAuthorityIdentity = {
  workspace: { id: string };
} & (
  | { type: 'system' | 'pendingActivationUser' }
  | {
      type: 'user';
      userWorkspaceId: string;
      application?: { id: string };
      agentId?: string;
    }
  | { type: 'application'; application: { id: string }; agentId?: string }
  | { type: 'apiKey'; apiKey: { id: string } }
  | { type: 'agent'; agentId: string }
);
