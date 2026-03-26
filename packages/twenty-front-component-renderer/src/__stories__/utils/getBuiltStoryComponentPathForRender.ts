type StoryComponentVariant = 'react' | 'preact';

export const getBuiltStoryComponentPathForRender = (
  componentName: string,
  variant: StoryComponentVariant = 'react',
): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const basePath = variant === 'preact' ? '/built-preact' : '/built';

  return `${origin}${basePath}/${componentName}.mjs`;
};
