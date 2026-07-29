const PROVIDER_TEMPLATE_VARIABLE_PATTERN =
  /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g;

// Mirrors how the provider expands a bulk template against per-recipient
// replacement data, so local sends show the message a recipient would receive.
export const substituteProviderTemplateVariables = (
  template: string,
  variables: Record<string, string>,
): string =>
  template.replace(
    PROVIDER_TEMPLATE_VARIABLE_PATTERN,
    (_match, variableName: string) => variables[variableName] ?? '',
  );
