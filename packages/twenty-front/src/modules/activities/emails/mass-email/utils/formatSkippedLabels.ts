const MAX_LISTED_SKIPPED_LABELS = 5;

// Long selections would otherwise turn the hint into a wall of text, so the
// tail is collapsed into a count rather than dropped without trace.
export const formatSkippedLabels = (labels: string[]): string => {
  const namedLabels = labels.slice(0, MAX_LISTED_SKIPPED_LABELS);
  const remainingCount = labels.length - namedLabels.length;

  if (remainingCount === 0) {
    return namedLabels.join(', ');
  }

  return `${namedLabels.join(', ')} +${remainingCount} more`;
};
