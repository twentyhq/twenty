export const parseAdditionalItems = <T>(
  additionalItems: T[] | string | null | undefined,
): T[] => {
  if (Array.isArray(additionalItems)) {
    return additionalItems;
  }

  if (typeof additionalItems === 'string') {
    try {
      const parsed = JSON.parse(additionalItems);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};
