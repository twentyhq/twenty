export const getMaxLabelLength = (labels?: string[]) => {
  if (!labels || labels.length === 0) {
    return 0;
  }

  return labels.reduce(
    (maxLength, label) => Math.max(maxLength, label?.length ?? 0),
    0,
  );
};
