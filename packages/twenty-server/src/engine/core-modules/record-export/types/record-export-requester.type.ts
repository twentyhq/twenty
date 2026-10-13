export type RecordExportRequester = {
  workspaceId: string;
} & (
  | {
      apiKeyId: string;
      userWorkspaceId?: never;
      workspaceMemberId?: never;
    }
  | {
      apiKeyId?: never;
      userWorkspaceId: string;
      workspaceMemberId: string;
    }
);
