export type TelemetryEvent = {
  action: string;
  workspaceId?: string;
  userWorkspaceId?: string;
  userId: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  locale?: string;
  serverUrl: string;
  serverId: string;
};
