export const buildIndexTablePageURL = (
  objectNamePlural: string,
  viewId?: string | null | undefined,
) => {
  return `/objects/${objectNamePlural}${viewId ? `?view=${viewId}` : ''}`;
};
