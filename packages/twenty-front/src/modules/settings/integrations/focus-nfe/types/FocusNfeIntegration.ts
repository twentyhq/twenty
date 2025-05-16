export type FocusNfeIntegration = {
  id: string;
  integrationName: string;
  token?: string;
  status?: string;
  workspaceId: string;
  workspace: {
    id: string;
  };
};
