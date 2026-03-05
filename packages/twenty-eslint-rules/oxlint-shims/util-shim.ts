// Shim for Node.js `util` module.

export const inspect = (value: unknown): string => JSON.stringify(value);
