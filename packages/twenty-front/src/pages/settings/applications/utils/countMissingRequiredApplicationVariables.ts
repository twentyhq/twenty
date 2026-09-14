import { isNonEmptyString } from '@sniptt/guards';

import { type ApplicationVariable } from '~/generated-metadata/graphql';

/**
 * How many variables the application declared as required are still empty.
 *
 * A required variable with no value means the application cannot work in this workspace, and
 * nothing else on this screen says so: every variable looks alike once installed, so an
 * installation that is one credential short is indistinguishable from a finished one.
 *
 * Deprecated variables never count, matching the precedence the manifest already applies.
 */
export const countMissingRequiredApplicationVariables = <
  CountableApplicationVariable extends Pick<
    ApplicationVariable,
    'value' | 'isRequired' | 'isDeprecated'
  >,
>(
  applicationVariables: CountableApplicationVariable[],
): number =>
  applicationVariables.filter(
    (applicationVariable) =>
      applicationVariable.isRequired &&
      !applicationVariable.isDeprecated &&
      !isNonEmptyString(applicationVariable.value),
  ).length;
