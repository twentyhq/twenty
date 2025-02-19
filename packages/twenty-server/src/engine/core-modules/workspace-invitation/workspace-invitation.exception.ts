import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceInvitationException extends CustomException {
  constructor(message: string, code: WorkspaceInvitationExceptionCode) {
    super(message, code);
  }
}

export enum WorkspaceInvitationExceptionCode {
  INVALID_APP_TOKEN_TYPE = 'INVALID_APP_TOKEN_TYPE',
  INVITATION_CORRUPTED = 'INVITATION_CORRUPTED',
  INVITATION_ALREADY_EXIST = 'INVITATION_ALREADY_EXIST',
  USER_ALREADY_EXIST = 'USER_ALREADY_EXIST',
  INVALID_INVITATION = 'INVALID_INVITATION',
  EMAIL_MISSING = 'EMAIL_MISSING',
}
