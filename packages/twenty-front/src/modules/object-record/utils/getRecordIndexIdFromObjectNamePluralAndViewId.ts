export const getRecordIndexIdFromObjectNamePluralAndViewId = (
  objectNamePlural: string,
  viewId: string,
): string => {
  return `${objectNamePlural}-${viewId}`;
};
