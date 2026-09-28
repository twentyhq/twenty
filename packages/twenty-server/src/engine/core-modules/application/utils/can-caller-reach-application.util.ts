import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';

// Sessions and API keys keep workspace-wide reach behind their permission
// flags; an application token only reaches its own application.
export const canCallerReachApplication = ({
  callingApplication,
  applicationId,
}: {
  callingApplication:
    | Pick<FlatApplication, 'id' | 'sourceType'>
    | null
    | undefined;
  applicationId: string | null | undefined;
}): boolean => {
  const scopedCallingApplication =
    getScopedCallingApplication(callingApplication);

  return (
    !isDefined(scopedCallingApplication) ||
    applicationId === scopedCallingApplication.id
  );
};
