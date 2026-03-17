import { isDefined } from 'twenty-shared/utils';

// GraphQL coerces a single value to a list when the schema expects a list type.
// Since direct execution bypasses schema validation, we must handle this
// for known list-typed arguments.
const LIST_TYPED_ARGS = new Set(['orderBy', 'orderByForRecords']);

export const coerceArgsForDirectExecution = (
  args: Record<string, unknown>,
): Record<string, unknown> => {
  for (const argName of LIST_TYPED_ARGS) {
    const value = args[argName];

    if (isDefined(value) && !Array.isArray(value)) {
      args[argName] = [value];
    }
  }

  return args;
};
