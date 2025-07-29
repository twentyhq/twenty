import { CustomException } from 'src/utils/custom-exception';

export class ViewFieldException extends CustomException {
  declare code: ViewFieldExceptionCode;
  constructor(
    message: string,
    code: ViewFieldExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum ViewFieldExceptionCode {
  VIEW_FIELD_NOT_FOUND = 'VIEW_FIELD_NOT_FOUND',
  INVALID_VIEW_FIELD_DATA = 'INVALID_VIEW_FIELD_DATA',
}
