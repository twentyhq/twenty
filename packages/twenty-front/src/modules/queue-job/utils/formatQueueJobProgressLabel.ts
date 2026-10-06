// A figure space is one digit wide, so single-digit labels keep the same width
const FIGURE_SPACE = ' ';

export const formatQueueJobProgressLabel = (progress: number): string => {
  const roundedProgress = Math.round(progress);
  const padding = roundedProgress < 10 ? FIGURE_SPACE : '';

  return `${padding}(${roundedProgress}%)`;
};
