// Thrown when the platform asks the SDK to operate on a connection whose
// OAuth refresh failed permanently (`authFailedAt` is set). The end user
// must reconnect from the app's settings tab — the app cannot recover on
// its own.
//
// `listConnections` filters these out by default (the user can't act on
// them anyway). `getConnection` throws this when the looked-up connection
// is in this state, so a stored connection id can be safely retried until
// it works again.
export class AppConnectionAuthFailedError extends Error {
  readonly connectionId: string;

  constructor(connectionId: string) {
    super(
      `App connection ${connectionId} requires the user to reconnect ` +
        `(authFailedAt is set). Surface a "Reconnect" prompt in your UI.`,
    );
    this.name = 'AppConnectionAuthFailedError';
    this.connectionId = connectionId;
  }
}
