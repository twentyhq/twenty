import { WorkspaceInvitationExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceInvitationException extends CustomException {
  constructor(message: string, code: WorkspaceInvitationExceptionCode) {
    super(message, code);
  }
}
