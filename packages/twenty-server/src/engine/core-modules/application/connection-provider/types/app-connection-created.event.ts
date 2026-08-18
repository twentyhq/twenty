export const APP_CONNECTION_CREATED_EVENT = 'appConnection.created';

export type AppConnectionCreatedEvent = {
  connectedAccountId: string;
  connectionProviderId: string;
  applicationId: string;
  workspaceId: string;
  userId: string;
};
