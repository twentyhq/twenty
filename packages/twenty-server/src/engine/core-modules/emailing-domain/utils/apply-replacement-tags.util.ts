const REPLACEMENT_TAG_PATTERN = /\{\{([a-zA-Z0-9_]+)\}\}/g;

export const applyReplacementTags = (
  template: string,
  replacements: Record<string, string>,
): string =>
  template.replace(REPLACEMENT_TAG_PATTERN, (match, tagName) =>
    Object.prototype.hasOwnProperty.call(replacements, tagName)
      ? replacements[tagName]
      : match,
  );
