export const serializeStyleDeclarationsToCssText = (
  cssValueByStoreKey: Record<string, string>,
  importantPriorityStoreKeys: Set<string>,
): string =>
  Object.entries(cssValueByStoreKey)
    .map(([storeKey, cssValue]) =>
      importantPriorityStoreKeys.has(storeKey)
        ? `${storeKey}:${cssValue} !important`
        : `${storeKey}:${cssValue}`,
    )
    .join(';');
