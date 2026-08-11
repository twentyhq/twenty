import { isNonEmptyString } from '@sniptt/guards';

import { type ApplicationVariable } from '~/generated-metadata/graphql';
import { shouldDisplayVariable } from '~/pages/settings/applications/utils/shouldDisplayVariable';

export const getDisplayedApplicationVariables = <
  DisplayableApplicationVariable extends Pick<
    ApplicationVariable,
    'key' | 'value' | 'isDeprecated'
  >,
>(
  applicationVariables: DisplayableApplicationVariable[],
): DisplayableApplicationVariable[] =>
  applicationVariables
    .filter((applicationVariable) =>
      shouldDisplayVariable({
        isDeprecated: applicationVariable.isDeprecated,
        hasValue: isNonEmptyString(applicationVariable.value),
      }),
    )
    .sort((a, b) => a.key.localeCompare(b.key));
