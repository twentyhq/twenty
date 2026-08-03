// Narrows a block's style attribute to the structured object the settings
// panel and renderers work with. Anything malformed reads as unstyled.
export const getBlockStyle = (value: unknown): Record<string, string> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
};
