export type WidgetVisibilityContext = {
  device: 'MOBILE' | 'DESKTOP';
  selectedRecords: Record<string, unknown>[];
  featureFlags: Record<string, boolean>;
  // Remove with the workspace workflow and workflowVersion objects, once the
  // core migration owns them.
  hiddenFieldMetadataIdsOrNames?: string[];
};
