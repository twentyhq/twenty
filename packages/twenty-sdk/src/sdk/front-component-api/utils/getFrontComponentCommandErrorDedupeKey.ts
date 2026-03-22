export const getFrontComponentCommandErrorDedupeKey = (
  frontComponentId: string,
): string => `${frontComponentId}-command-error`;
