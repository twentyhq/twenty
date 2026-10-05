import { isNonEmptyString } from '@sniptt/guards';

import { type ApplicationVariable } from '~/generated-metadata/graphql';

export const getMissingRequiredApplicationVariables = <
  RequirableApplicationVariable extends Pick<
    ApplicationVariable,
    'key' | 'label' | 'value' | 'isRequired'
  >,
>(
  applicationVariables: RequirableApplicationVariable[],
): RequirableApplicationVariable[] =>
  applicationVariables
    .filter(
      (applicationVariable) =>
        applicationVariable.isRequired &&
        !isNonEmptyString(applicationVariable.value),
    )
    .sort((a, b) => a.key.localeCompare(b.key));
