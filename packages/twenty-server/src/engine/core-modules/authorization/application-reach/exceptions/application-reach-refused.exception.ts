import { ForbiddenException } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

export class ApplicationReachRefusedException extends ForbiddenException {
  readonly userFriendlyMessage = msg`You do not have permission to perform this action.`;
}
