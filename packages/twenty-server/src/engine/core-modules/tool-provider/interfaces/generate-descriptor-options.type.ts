export type GenerateDescriptorOptions = {
  includeSchemas?: boolean;
  toolNames?: Set<string>;
  // When true, emit every tool the provider could expose for the workspace,
  // ignoring the caller's role permissions. Used to enumerate the full tool
  // universe so the registry can tell "exists but forbidden" apart from
  // "does not exist". Never use this to build an executable catalog.
  ignorePermissions?: boolean;
};
