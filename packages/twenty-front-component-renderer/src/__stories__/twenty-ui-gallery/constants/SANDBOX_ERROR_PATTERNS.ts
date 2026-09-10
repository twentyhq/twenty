export const SANDBOX_ERROR_PATTERNS = {
  TABS_ORDER:
    /^(?:Uncaught TypeError: )?\w+\.compareDocumentPosition is not a function$/,
  COMPOSED_PATH:
    "Uncaught TypeError: Cannot use 'in' operator to search for 'composedPath' in undefined",
  VIEWPORT_WIDTH:
    "Uncaught TypeError: Cannot read properties of undefined (reading 'width')",
  POINTER_TYPE:
    "Uncaught TypeError: Cannot read properties of undefined (reading 'pointerType')",
};
