import { type MeetExceptionCode } from 'src/logic-functions/types/meet-exception-code.type';

export class MeetException extends Error {
  readonly code: MeetExceptionCode;
  readonly httpStatus: number | undefined;
  readonly googleStatus: string | undefined;

  constructor({
    message,
    code,
    httpStatus,
    googleStatus,
  }: {
    message: string;
    code: MeetExceptionCode;
    httpStatus?: number;
    googleStatus?: string;
  }) {
    super(message);
    this.name = 'MeetException';
    this.code = code;
    this.httpStatus = httpStatus;
    this.googleStatus = googleStatus;
  }
}
