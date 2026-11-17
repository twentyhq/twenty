export class GoogleMeetRequestError extends Error {
  readonly httpStatus: number;
  readonly googleStatus: string | undefined;

  constructor({
    message,
    httpStatus,
    googleStatus,
  }: {
    message: string;
    httpStatus: number;
    googleStatus: string | undefined;
  }) {
    super(message);
    this.name = 'GoogleMeetRequestError';
    this.httpStatus = httpStatus;
    this.googleStatus = googleStatus;
  }
}
