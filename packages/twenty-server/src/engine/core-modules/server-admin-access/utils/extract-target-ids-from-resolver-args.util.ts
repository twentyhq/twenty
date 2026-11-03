import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

const IDENTIFIER_ARGUMENT_NAME_PATTERN = /(^id|Id)$/;

// Only identifiers are kept: other arguments can carry secrets (config values, provider API keys).
export const extractTargetIdsFromResolverArgs = (
  args: Record<string, unknown>,
): Record<string, string> => {
  const targetIds: Record<string, string> = {};

  const collect = (values: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(values)) {
      if (
        IDENTIFIER_ARGUMENT_NAME_PATTERN.test(name) &&
        isNonEmptyString(value)
      ) {
        targetIds[name] = value;
      }
    }
  };

  collect(args);

  for (const value of Object.values(args)) {
    if (isPlainObject(value)) {
      collect(value);
    }
  }

  return targetIds;
};
