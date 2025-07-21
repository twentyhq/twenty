export const getMergeManyRecordsMutationResponseField = (
  objectNamePlural: string,
): string => {
  return `merge${objectNamePlural.charAt(0).toUpperCase()}${objectNamePlural.slice(1)}`;
};
