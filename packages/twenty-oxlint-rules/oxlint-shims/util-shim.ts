// Shim for Node.js `util` module (used by micromatch via eslint-plugin-lingui).

export const inspect = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};
