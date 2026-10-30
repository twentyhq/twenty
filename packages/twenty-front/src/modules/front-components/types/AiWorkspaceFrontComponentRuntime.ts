export type AiWorkspaceFrontComponentRuntime = {
  applicationId: string;
  componentSource: string;
  sharedDependenciesSource?: string;
  sharedDependenciesChecksum?: string;
  data: Record<string, unknown>;
};
