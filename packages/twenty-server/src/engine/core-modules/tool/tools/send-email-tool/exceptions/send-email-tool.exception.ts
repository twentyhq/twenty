import { CustomException } from 'src/utils/custom-exception';

export class SendEmailToolException extends CustomException<SendEmailToolExceptionCode> {}

export enum SendEmailToolExceptionCode {
  INVALID_CONNECTED_ACCOUNT_ID = 'INVALID_CONNECTED_ACCOUNT_ID',
  CONNECTED_ACCOUNT_NOT_FOUND = 'CONNECTED_ACCOUNT_NOT_FOUND',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WORKSPACE_ID_NOT_FOUND = 'WORKSPACE_ID_NOT_FOUND',
}
