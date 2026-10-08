const ARIA_OR_DATA_ATTRIBUTE_PREFIXES = ['aria-', 'data-'];

export const isAriaOrDataAttribute = (attributeName: string): boolean => {
  const lowercasedAttributeName = attributeName.toLowerCase();

  return ARIA_OR_DATA_ATTRIBUTE_PREFIXES.some((attributePrefix) =>
    lowercasedAttributeName.startsWith(attributePrefix),
  );
};
