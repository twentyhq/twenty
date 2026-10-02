export const SANDBOX_ERROR_PATTERNS = {
  VIEWPORT_WIDTH:
    "Uncaught TypeError: Cannot read properties of undefined (reading 'width')",
  NATIVE_EVENT_DEFAULT_PREVENTED:
    "Uncaught TypeError: Cannot read properties of undefined (reading 'defaultPrevented')",
  MISSING_EVENT_CONSTRUCTOR:
    "Uncaught TypeError: Right-hand side of 'instanceof' is not an object",
  ELEMENT_CONTAINS:
    /^(?:Uncaught TypeError: )?\w+\.contains is not a function$/,
  ELEMENT_DATASET:
    "Uncaught TypeError: Cannot read properties of undefined (reading 'type')",
  HOST_EVENT_LISTENER: 'Uncaught TypeError: listener is not a function',
};
