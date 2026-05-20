// Avoids a circular dependency between ToolProviderModule and
// NavigationMenuItemToolsModule by going through an injection token.
export const NAVIGATION_MENU_ITEM_TOOL_SERVICE_TOKEN = Symbol(
  'NAVIGATION_MENU_ITEM_TOOL_SERVICE',
);
