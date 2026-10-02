export type WorkspaceLoginAccess =
  | { type: 'member' }
  | { type: 'invitation'; roleId?: string };
