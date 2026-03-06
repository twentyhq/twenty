// Shim for Node.js `util` module (used by micromatch via eslint-plugin-lingui).

export const inspect = (value: unknown): string => JSON.stringify(value);
