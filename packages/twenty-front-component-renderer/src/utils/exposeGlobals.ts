export const exposeGlobals = (globals: Record<string, unknown>): void => {
  for (const [key, value] of Object.entries(globals)) {
    (globalThis as Record<string, unknown>)[key] = value;
  }
};
