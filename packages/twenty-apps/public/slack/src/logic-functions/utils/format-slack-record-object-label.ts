const CAMEL_CASE_BOUNDARY_PATTERN = /([a-z0-9])([A-Z])/g;

export const formatSlackRecordObjectLabel = (
  objectNameSingular: string,
): string => {
  const spacedLabel = objectNameSingular
    .replace(CAMEL_CASE_BOUNDARY_PATTERN, '$1 $2')
    .toLowerCase();

  return `${spacedLabel.charAt(0).toUpperCase()}${spacedLabel.slice(1)}`;
};
