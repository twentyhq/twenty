export class TwentyRequestError extends Error {
  constructor(
    readonly status: number,
    url: string,
  ) {
    super(
      `Twenty returned ${status} for ${new URL(url).pathname}. ${status === 401 ? 'Reconnect your workspace.' : 'Please try again.'}`,
    );
    this.name = 'TwentyRequestError';
  }
}
