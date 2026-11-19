export type WidgetVisibilityContext = {
  device: 'MOBILE' | 'DESKTOP';
  selectedRecords: Record<string, unknown>[];
  featureFlags: Record<string, boolean>;
};
