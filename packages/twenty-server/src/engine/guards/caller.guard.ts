import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  type Type,
} from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CALLER_REFUSED_MESSAGE } from 'src/engine/guards/constants/caller-refused-message.constant';
import { type CallerGuardConfig } from 'src/engine/guards/types/caller-guard-config.type';
import { classifyCaller } from 'src/engine/guards/utils/classify-caller.util';
import { getRequestOrThrowWhenUnauthenticated } from 'src/engine/guards/utils/get-request-or-throw-when-unauthenticated.util';
import { isCallerVariantAccepted } from 'src/engine/guards/utils/is-caller-variant-accepted.util';

export const CallerGuard = (
  callerGuardConfig: CallerGuardConfig,
): Type<CanActivate> => {
  @Injectable()
  class CallerMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = getRequestOrThrowWhenUnauthenticated(context);
      const callerVariant = isDefined(request)
        ? classifyCaller(request)
        : undefined;

      if (
        isDefined(callerVariant) &&
        isCallerVariantAccepted({ callerGuardConfig, callerVariant })
      ) {
        return true;
      }

      // A 403 on REST and FORBIDDEN on GraphQL, and unlike a GraphQL error thrown
      // from a guard, Nest does not log it as an unhandled exception.
      throw new ForbiddenException(CALLER_REFUSED_MESSAGE);
    }
  }

  return mixin(CallerMixin);
};
