export const getDynamicViewName = (
  viewName: string,
  objectLabelPlural: string,
) => {
  return viewName.replace('{objectLabelPlural}', objectLabelPlural);
};
