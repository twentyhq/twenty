// A figure space is exactly one digit wide, so a single-digit percentage keeps
// a label the same width as a two-digit one
const FIGURE_SPACE = ' ';

export const formatQueueJobProgressLabel = (progress: number): string => {
  const roundedProgress = Math.round(progress);
  const padding = roundedProgress < 10 ? FIGURE_SPACE : '';

  return `${padding}(${roundedProgress}%)`;
};
