export const truncateFieldLabel = (label: string, maxLength = 15): string => {
  if (label.length <= maxLength) {
    return label;
  }
  // Shorten to the max length
  const trimmedString = label.substring(0, maxLength);
  // Find the last space to avoid cutting a word in half
  const lastSpace = trimmedString.lastIndexOf(' ');

  // Use substring up to the last space, or the hard limit if no space is found
  const finalString =
    lastSpace > 0 ? trimmedString.substring(0, lastSpace) : trimmedString;

  return finalString + '...';
};
