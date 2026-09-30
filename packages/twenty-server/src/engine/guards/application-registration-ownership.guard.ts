import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { APPLICATION_TARGET_METADATA_KEY } from 'src/engine/core-modules/application/constants/application-target-metadata-key.constant';
import { type ApplicationTarget } from 'src/engine/core-modules/application/types/application-target.type';
import {
  getApplicationTargetName,
  readApplicationTargetValue,
} from 'src/engine/core-modules/application/utils/read-application-target-value.util';
import { getRequest } from 'src/utils/extract-request';

// Authoring endpoints (file uploads, sync) may only touch an application whose
// registration the calling workspace owns. That ownership is what keeps a
// non-owner from replacing an app's code and reaching the registration's server
// variables at execution time. Unlike ApplicationTargetGuard, which confines
// application tokens to their own app, this runs for every principal, since a
// session or API key in another workspace must be refused just the same.
@Injectable()
export class ApplicationRegistrationOwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const target = this.reflector.get<ApplicationTarget | undefined>(
      APPLICATION_TARGET_METADATA_KEY,
      context.getHandler(),
    );

    if (!isDefined(target) || target.requireWorkspaceOwnership !== true) {
      return true;
    }

    const request = getRequest(context);
    const workspaceId: string | undefined = request?.workspace?.id;

    if (!isNonEmptyString(workspaceId)) {
      throw new ApplicationException(
        'Missing workspace for the application registration ownership check',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    const targetValue = readApplicationTargetValue({
      context,
      request,
      target,
    });

    if (!isNonEmptyString(targetValue)) {
      throw new ApplicationException(
        `Missing application target "${getApplicationTargetName(target)}"`,
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    if (target.kind !== 'applicationUniversalIdentifier') {
      throw new ApplicationException(
        `Workspace ownership is not supported for application target kind "${target.kind}"`,
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    await this.applicationRegistrationService.findOneOwnedByWorkspaceOrThrow({
      universalIdentifier: targetValue,
      workspaceId,
    });

    return true;
  }
}
