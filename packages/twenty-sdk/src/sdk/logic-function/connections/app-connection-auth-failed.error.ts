// Thrown by SDK callers (or constructed by app code) when an `AppConnection`
// has `authFailedAt` set — the user must reconnect from the app's settings
// tab before the credential can be used again.
export class AppConnectionAuthFailedError extends Error {
  readonly connectionId: string;
  readonly providerName: string;

  constructor(connectionId: string, providerName: string) {
    super(
      `Connection "${connectionId}" for provider "${providerName}" needs to be reconnected — the last refresh attempt failed.`,
    );
    this.name = 'AppConnectionAuthFailedError';
    this.connectionId = connectionId;
    this.providerName = providerName;
  }
}
