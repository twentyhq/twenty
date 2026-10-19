import { isNonEmptyString } from '@sniptt/guards';

import { shouldDisplayVariable } from '@/settings/applications/utils/shouldDisplayVariable';
import { type ApplicationVariable } from '~/generated-metadata/graphql';

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
