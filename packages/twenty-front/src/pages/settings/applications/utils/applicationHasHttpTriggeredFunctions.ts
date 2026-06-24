import { isDefined } from 'twenty-shared/utils';

import { type Application } from '~/generated-metadata/graphql';

// True when the application exposes at least one HTTP-triggered logic function
// (i.e. a function reachable over a public URL).
export const applicationHasHttpTriggeredFunctions = (
  application?: Pick<Application, 'logicFunctions'>,
): boolean =>
  (application?.logicFunctions ?? []).some((logicFunction) =>
    isDefined(logicFunction.httpRouteTriggerSettings),
  );
