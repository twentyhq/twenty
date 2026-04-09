const CATEGORY_PREFIX = 'CATEGORY_';

export const computeGmailDefaultNotSyncedLabelsSearchFilter = (
  labelId: string,
): string => {
  if (labelId.startsWith(CATEGORY_PREFIX)) {
    const category = labelId.slice(CATEGORY_PREFIX.length).toLowerCase();

    return `-category:${category}`;
  }

  return `-label:${labelId.toLowerCase()}`;
};
