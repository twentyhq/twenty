import { type GoogleMeetExceptionCode } from 'src/logic-functions/types/google-meet-exception-code.type';

export class GoogleMeetException extends Error {
  readonly code: GoogleMeetExceptionCode;
  readonly httpStatus: number | undefined;
  readonly googleStatus: string | undefined;

  constructor({
    message,
    code,
    httpStatus,
    googleStatus,
  }: {
    message: string;
    code: GoogleMeetExceptionCode;
    httpStatus?: number;
    googleStatus?: string;
  }) {
    super(message);
    this.name = 'GoogleMeetException';
    this.code = code;
    this.httpStatus = httpStatus;
    this.googleStatus = googleStatus;
  }
}
