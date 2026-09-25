import { isNonEmptyString } from '@sniptt/guards';
import { conditionalAvailabilityParser } from 'twenty-shared/utils';

const FEATURE_FLAGS_VARIABLE_PREFIX = 'featureFlags.';

export const isFeatureFlagOnlyAvailabilityExpression = (
  expression: string | null | undefined,
): boolean => {
  if (!isNonEmptyString(expression)) {
    return false;
  }

  try {
    const variables = conditionalAvailabilityParser
      .parse(expression)
      .variables({ withMembers: true });

    return (
      variables.length > 0 &&
      variables.every((variable) =>
        variable.startsWith(FEATURE_FLAGS_VARIABLE_PREFIX),
      )
    );
  } catch {
    return false;
  }
};
