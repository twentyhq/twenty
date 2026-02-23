export const getFrontComponentActionErrorDedupeKey = (
  frontComponentId: string,
): string => `${frontComponentId}-action-error`;
