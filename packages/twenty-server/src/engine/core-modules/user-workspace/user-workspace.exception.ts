import { CustomException } from 'src/utils/custom-exception';

export class UserWorkspaceException extends CustomException {
  declare code: UserWorkspaceExceptionCode;
  constructor(message: string, code: UserWorkspaceExceptionCode) {
    super(message, code);
  }
}

export enum UserWorkspaceExceptionCode {
  USER_WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
}
