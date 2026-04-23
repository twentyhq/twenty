export type ToolContext = {
  workspaceId: string;
  userId?: string;
  roleId?: string;
  [key: string]: unknown;
};
