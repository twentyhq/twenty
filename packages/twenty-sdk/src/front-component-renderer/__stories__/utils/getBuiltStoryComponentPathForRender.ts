// Returns an absolute URL because the worker runs inside a Blob URL
// where relative paths cannot be resolved.
export const getBuiltStoryComponentPathForRender = (
  componentName: string,
): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return `${origin}/built/${componentName}.mjs`;
};
