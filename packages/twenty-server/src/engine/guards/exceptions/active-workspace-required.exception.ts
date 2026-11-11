import { ForbiddenException } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

// An HTTP exception like AuthPrincipalRefusedException, so REST answers 403 and GraphQL maps it to FORBIDDEN
export class ActiveWorkspaceRequiredException extends ForbiddenException {
  readonly userFriendlyMessage = msg`This action is only available once your workspace is active.`;

  constructor() {
    super('This action requires an active workspace');
  }
}
