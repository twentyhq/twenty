export const buildShowPageURL = (
  objectNameSingular: string,
  recordId: string,
  viewId?: string | null | undefined,
) => {
  return `/object/${objectNameSingular}/${recordId}${
    viewId ? `?view=${viewId}` : ''
  }`;
};
