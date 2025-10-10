export const truncateTickLabel = (
  value: string | number,
  maxLength: number,
): string => {
  const stringValue = String(value);
  if (stringValue.length <= maxLength) {
    return stringValue;
  }
  return `${stringValue.slice(0, maxLength - 3)}...`;
};
