export const formatConsoleArg = (arg: unknown): unknown => {
  if (typeof arg !== 'object' || arg === null) {
    return arg;
  }

  const seen = new WeakSet<object>();

  return JSON.stringify(
    arg,
    (_key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value as object)) {
          return '[Circular]';
        }
        seen.add(value as object);
      }

      return value;
    },
    2,
  );
};
