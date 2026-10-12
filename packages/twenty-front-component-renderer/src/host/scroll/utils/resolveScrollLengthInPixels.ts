export const resolveScrollLengthInPixels = ({
  length,
  referenceSize,
}: {
  length: string;
  referenceSize: number;
}): number => {
  const numericLength = Number.parseFloat(length);

  if (!Number.isFinite(numericLength)) {
    return 0;
  }

  return length.trim().endsWith('%')
    ? (numericLength * referenceSize) / 100
    : numericLength;
};
