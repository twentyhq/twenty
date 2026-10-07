// Metadata field order is not stable across workspaces, so ties fall back to a locale-independent name order.
export const compareFieldMetadataItemNames = (
  fieldA: { name: string },
  fieldB: { name: string },
) => {
  if (fieldA.name < fieldB.name) {
    return -1;
  }

  return fieldA.name > fieldB.name ? 1 : 0;
};
