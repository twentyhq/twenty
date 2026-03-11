export type GetWorkspaceGraphQLSchemaFn = (params: {
  workspaceId: string;
  applicationId: string;
}) => Promise<string>;
