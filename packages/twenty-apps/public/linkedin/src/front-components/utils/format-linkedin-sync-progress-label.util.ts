const FIGURE_SPACE = '\u2007';

export const formatLinkedinSyncProgressLabel = (progress: number): string => {
  const roundedProgress = Math.round(progress);
  const padding = roundedProgress < 10 ? FIGURE_SPACE : '';

  return `${padding}(${roundedProgress}%)`;
};
