import { CustomException } from 'src/utils/custom-exception';

export class ThrottlerException extends CustomException<ThrottlerExceptionCode> {}

export enum ThrottlerExceptionCode {
  LIMIT_REACHED = 'LIMIT_REACHED',
}
