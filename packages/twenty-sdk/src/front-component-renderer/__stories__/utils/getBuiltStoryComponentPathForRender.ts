type StoryComponentVariant = 'react' | 'preact';

// Returns an absolute URL because the worker runs inside a Blob URL
// where relative paths cannot be resolved.
export const getBuiltStoryComponentPathForRender = (
  componentName: string,
  variant: StoryComponentVariant = 'react',
): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const basePath = variant === 'preact' ? '/built-preact' : '/built';

  return `${origin}${basePath}/${componentName}.mjs`;
};
