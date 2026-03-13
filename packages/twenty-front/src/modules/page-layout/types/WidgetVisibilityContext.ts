export type WidgetVisibilityContext = {
  device: 'MOBILE' | 'DESKTOP';
  // Current record's scalar field values, used for conditional widget display rules
  record?: Record<string, unknown>;
};
