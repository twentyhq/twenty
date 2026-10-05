import { ForbiddenException } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { AUTH_PRINCIPAL_REFUSED_MESSAGE } from 'src/engine/guards/constants/auth-principal-refused-message.constant';

export class AuthPrincipalRefusedException extends ForbiddenException {
  // Read off the exception by the GraphQL error handler, which otherwise falls
  // back to a generic message for an HTTP exception.
  readonly userFriendlyMessage = msg`You do not have permission to perform this action.`;

  constructor() {
    super(AUTH_PRINCIPAL_REFUSED_MESSAGE);
  }
}
