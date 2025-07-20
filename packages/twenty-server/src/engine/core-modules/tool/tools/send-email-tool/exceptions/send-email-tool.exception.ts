import { CustomException } from 'src/utils/custom-exception';

export class SendEmailToolException extends CustomException {
  constructor(message: string, code: SendEmailToolExceptionCode) {
    super(message, code);
  }
}

export enum SendEmailToolExceptionCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_CONNECTED_ACCOUNT_ID = 'INVALID_CONNECTED_ACCOUNT_ID',
  CONNECTED_ACCOUNT_NOT_FOUND = 'CONNECTED_ACCOUNT_NOT_FOUND',
  INVALID_EMAIL = 'INVALID_EMAIL',
  SEND_FAILED = 'SEND_FAILED',
  WORKSPACE_ID_NOT_FOUND = 'WORKSPACE_ID_NOT_FOUND',
}
