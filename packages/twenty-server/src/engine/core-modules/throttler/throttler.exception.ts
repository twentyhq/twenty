import { CustomException } from 'src/utils/custom-exception';

export class ThrottlerException extends CustomException {
  code: ThrottlerExceptionCode;
  constructor(message: string, code: ThrottlerExceptionCode) {
    super(message, code);
  }
}

export enum ThrottlerExceptionCode {
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
}
