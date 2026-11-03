import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

const IDENTIFIER_ARGUMENT_NAME_PATTERN = /(^ids?|Ids?)$/;

// Only identifiers, from the top level then the typed `input` object: other arguments, JSON ones included, can carry secrets.
export const extractTargetIdsFromResolverArgs = (
  args: Record<string, unknown>,
): Record<string, string | string[]> => {
  const targetIds: Record<string, string | string[]> = {};

  const collect = (values: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(values)) {
      if (!IDENTIFIER_ARGUMENT_NAME_PATTERN.test(name) || name in targetIds) {
        continue;
      }

      if (isNonEmptyString(value)) {
        targetIds[name] = value;
      } else if (
        Array.isArray(value) &&
        isNonEmptyArray(value) &&
        value.every(isNonEmptyString)
      ) {
        targetIds[name] = value;
      }
    }
  };

  collect(args);

  if (isPlainObject(args.input)) {
    collect(args.input);
  }

  return targetIds;
};
