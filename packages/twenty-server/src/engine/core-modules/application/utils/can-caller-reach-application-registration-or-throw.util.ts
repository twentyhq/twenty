import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';

export const canCallerReachApplicationRegistrationOrThrow = ({
  callingApplication,
  applicationRegistrationId,
}: {
  callingApplication:
    | Pick<FlatApplication, 'applicationRegistrationId' | 'sourceType'>
    | null
    | undefined;
  applicationRegistrationId: string;
}): void => {
  const scopedCallingApplication =
    getScopedCallingApplication(callingApplication);

  if (
    isDefined(scopedCallingApplication) &&
    scopedCallingApplication.applicationRegistrationId !==
      applicationRegistrationId
  ) {
    throw new ApplicationException(
      'An application token can only reach its own application registration',
      ApplicationExceptionCode.FORBIDDEN,
    );
  }
};
