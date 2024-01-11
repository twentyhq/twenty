export const getScopeIdFromComponentId = (componentId?: string) =>
  componentId ? `${componentId}-scope` : undefined;
