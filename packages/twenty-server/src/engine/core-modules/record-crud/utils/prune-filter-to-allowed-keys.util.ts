const LOGICAL_ARRAY_KEYS = ['and', 'or'];
const LOGICAL_OBJECT_KEY = 'not';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Recursively drops filter keys that are neither a known field (per
 * `allowedKeys`) nor a logical operator (`and`/`or`/`not`). The AI find tool
 * spreads field filters at the args root, so a model that emits a bare operator
 * where a field name belongs (e.g. `{ ilike: "foo" }`) would otherwise reach
 * the query runner and throw `Object <x> doesn't have any "ilike" field`. This
 * keeps malformed filters from ever hitting the runner.
 *
 * `allowedKeys` must contain the valid field names AND the logical keys.
 */
export const pruneFilterToAllowedKeys = (
  filter: unknown,
  allowedKeys: Set<string>,
): { filter: Record<string, unknown>; droppedKeys: string[] } => {
  const droppedKeys: string[] = [];

  const prune = (node: unknown): Record<string, unknown> => {
    if (!isPlainObject(node)) {
      return {};
    }

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(node)) {
      if (!allowedKeys.has(key)) {
        droppedKeys.push(key);
        continue;
      }

      if (LOGICAL_ARRAY_KEYS.includes(key)) {
        if (Array.isArray(value)) {
          result[key] = value.map((item) => prune(item));
        }
        continue;
      }

      if (key === LOGICAL_OBJECT_KEY) {
        result[key] = prune(value);
        continue;
      }

      // Known field: keep its operator object verbatim (the zod tool schema
      // already validated the operator shape the model was offered).
      result[key] = value;
    }

    return result;
  };

  return { filter: prune(filter), droppedKeys };
};
