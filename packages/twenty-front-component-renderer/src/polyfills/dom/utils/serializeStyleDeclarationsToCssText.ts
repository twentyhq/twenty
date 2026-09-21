export const serializeStyleDeclarationsToCssText = (
  cssValueByCssPropertyName: Record<string, string>,
): string =>
  Object.entries(cssValueByCssPropertyName)
    .map(([cssPropertyName, cssValue]) => `${cssPropertyName}:${cssValue}`)
    .join(';');
