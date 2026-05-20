// Avoids a circular dependency between ToolProviderModule and
// PageLayoutToolsModule by going through an injection token.
export const PAGE_LAYOUT_TOOL_SERVICE_TOKEN = Symbol(
  'PAGE_LAYOUT_TOOL_SERVICE',
);
