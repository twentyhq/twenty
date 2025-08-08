import { CustomException } from 'src/utils/custom-exception';

export class UserWorkspaceException extends CustomException<UserWorkspaceExceptionCode> {}

export enum UserWorkspaceExceptionCode {
  USER_WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
}
