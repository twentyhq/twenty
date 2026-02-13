export const getBuiltStoryComponentPathForRender = (
  componentName: string,
): string => {
  return `/built/${componentName}.mjs`;
};
