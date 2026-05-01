// Thrown by `useOAuth` when no connection exists for the named provider.
// App authors who want to handle this case explicitly can either catch
// this error or use `useOptionalOAuth` instead.
export class OAuthNotConnectedError extends Error {
  readonly providerName: string;

  constructor(providerName: string) {
    super(
      `OAuth provider "${providerName}" is not connected. Open the app's settings and connect it first.`,
    );
    this.name = 'OAuthNotConnectedError';
    this.providerName = providerName;
  }
}
