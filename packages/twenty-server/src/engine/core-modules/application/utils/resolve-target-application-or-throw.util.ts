import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

type TargetApplication =
  | {
      targetApplicationId: string;
      targetApplicationUniversalIdentifier?: never;
    }
  | {
      targetApplicationId?: never;
      targetApplicationUniversalIdentifier: string;
    };

export const resolveTargetApplicationOrThrow = ({
  callingApplication,
  applicationId,
  applicationUniversalIdentifier,
}: {
  callingApplication:
    | Pick<FlatApplication, 'id' | 'universalIdentifier'>
    | null
    | undefined;
  applicationId?: string | null;
  applicationUniversalIdentifier?: string | null;
}): TargetApplication => {
  if (!isDefined(callingApplication)) {
    if (isDefined(applicationId) && isDefined(applicationUniversalIdentifier)) {
      throw new ApplicationException(
        'applicationId and applicationUniversalIdentifier cannot both be given',
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    if (isDefined(applicationId)) {
      return { targetApplicationId: applicationId };
    }

    if (isDefined(applicationUniversalIdentifier)) {
      return {
        targetApplicationUniversalIdentifier: applicationUniversalIdentifier,
      };
    }

    throw new ApplicationException(
      'applicationId or applicationUniversalIdentifier is required unless the caller is an application',
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  const namesAnotherApplication =
    (isDefined(applicationId) && applicationId !== callingApplication.id) ||
    (isDefined(applicationUniversalIdentifier) &&
      applicationUniversalIdentifier !==
        callingApplication.universalIdentifier);

  if (namesAnotherApplication) {
    throw new ApplicationException(
      'An application token can only target its own application',
      ApplicationExceptionCode.FORBIDDEN,
    );
  }

  return { targetApplicationId: callingApplication.id };
};
