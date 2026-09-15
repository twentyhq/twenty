import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const toJsonSafe = (value: unknown, ancestors: WeakSet<object>): unknown => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  if (ancestors.has(value)) {
    return '[Circular]';
  }
  if ('toJSON' in value) {
    // Leave toJSON producers in place so the stringify below keeps calling
    // them, e.g. Dates staying ISO strings like in the primary pass.
    return value;
  }
  ancestors.add(value);
  const safe = Array.isArray(value)
    ? value.map((item) => toJsonSafe(item, ancestors))
    : Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          toJsonSafe(item, ancestors),
        ]),
      );
  ancestors.delete(value);
  return safe;
};

export const normalizeToolOutputToJsonValues = (
  output: ToolOutput,
): ToolOutput => {
  try {
    return JSON.parse(JSON.stringify(output));
  } catch {
    // stringify only throws on bigints and cycles, and returning the raw value
    // would re-arm the ModelMessage schema crash this util exists to prevent,
    // so the fallback neutralizes both instead of passing them through.
    try {
      return JSON.parse(
        JSON.stringify(toJsonSafe(output, new WeakSet<object>())),
      );
    } catch {
      return output;
    }
  }
};
