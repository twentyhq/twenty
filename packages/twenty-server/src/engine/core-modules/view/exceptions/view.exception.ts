import { CustomException } from 'src/utils/custom-exception';

export class ViewException extends CustomException {
  declare code: ViewExceptionCode;
  constructor(
    message: string,
    code: ViewExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum ViewExceptionCode {
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  INVALID_VIEW_DATA = 'INVALID_VIEW_DATA',
}
