export const SANDBOX_ERROR_PATTERNS = {
  ELEMENT_CONTAINS:
    /^(?:Uncaught TypeError: )?\w+\.contains is not a function$/,
  ELEMENT_DATASET:
    "Uncaught TypeError: Cannot read properties of undefined (reading 'type')",
  HOST_EVENT_LISTENER: 'Uncaught TypeError: listener is not a function',
};
