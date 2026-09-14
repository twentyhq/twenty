export const SANDBOX_ERROR_PATTERNS = {
  DOCUMENT_POSITION:
    /^(?:Uncaught TypeError: )?\w+\.compareDocumentPosition is not a function$/,
  COMPOSED_PATH:
    "Uncaught TypeError: Cannot use 'in' operator to search for 'composedPath' in undefined",
  VIEWPORT_WIDTH:
    "Uncaught TypeError: Cannot read properties of undefined (reading 'width')",
  POINTER_TYPE:
    "Uncaught TypeError: Cannot read properties of undefined (reading 'pointerType')",
  ELEMENT_MATCHES: /^(?:Uncaught TypeError: )?\w+\.matches is not a function$/,
  POINTER_EVENT_CONSTRUCTOR:
    /^Uncaught TypeError: .+\.PointerEvent is not a constructor$/,
};
