import {
  type OAuthClientProvider,
  type OAuthDiscoveryState,
} from '@modelcontextprotocol/sdk/client/auth.js';
import {
  type OAuthClientInformationMixed,
  type OAuthClientMetadata,
  type OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';
import { type OAuthDiscoveryRegistrationMethod } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-registration-method.type';

type OAuthDiscoveryClientProviderOptions = {
  redirectUrl: string;
  clientMetadataUrl: string | undefined;
  clientMetadata: OAuthClientMetadata;
  storedClient: OAuthDiscoveryStoredClient | null;
  codeVerifier?: string;
  // The authorize step discovers afresh; the callback reuses what it found.
  shouldReuseStoredDiscoveryState: boolean;
  now: Date;
};

export class OAuthDiscoveryClientProvider implements OAuthClientProvider {
  authorizationUrl: URL | undefined;
  savedCodeVerifier: string | undefined;
  savedTokens: OAuthTokens | undefined;
  isStoredClientInvalidated = false;

  private registeredClientInformation: OAuthClientInformationMixed | undefined;
  private discoveredState: OAuthDiscoveryState | undefined;
  private isStoredDiscoveryStateInvalidated = false;

  constructor(private readonly options: OAuthDiscoveryClientProviderOptions) {}

  get redirectUrl(): string {
    return this.options.redirectUrl;
  }

  get clientMetadataUrl(): string | undefined {
    return this.options.clientMetadataUrl;
  }

  get clientMetadata(): OAuthClientMetadata {
    return this.options.clientMetadata;
  }

  clientInformation(): OAuthClientInformationMixed | undefined {
    if (isDefined(this.registeredClientInformation)) {
      return this.registeredClientInformation;
    }

    if (this.isStoredClientInvalidated) {
      return undefined;
    }

    return this.isStoredClientUsable()
      ? this.options.storedClient?.clientInformation
      : undefined;
  }

  saveClientInformation(clientInformation: OAuthClientInformationMixed): void {
    this.registeredClientInformation = clientInformation;
  }

  // Connecting always asks the user; refreshing happens outside the SDK flow.
  tokens(): undefined {
    return undefined;
  }

  saveTokens(tokens: OAuthTokens): void {
    this.savedTokens = tokens;
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    this.authorizationUrl = authorizationUrl;
  }

  saveCodeVerifier(codeVerifier: string): void {
    this.savedCodeVerifier = codeVerifier;
  }

  codeVerifier(): string {
    if (!isDefined(this.options.codeVerifier)) {
      throw new ConnectionProviderException(
        'No PKCE code verifier for this OAuth discovery sign-in',
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }

    return this.options.codeVerifier;
  }

  invalidateCredentials(
    scope: 'all' | 'client' | 'tokens' | 'verifier' | 'discovery',
  ): void {
    if (scope === 'all' || scope === 'client') {
      this.isStoredClientInvalidated = true;
      this.registeredClientInformation = undefined;
    }

    if (scope === 'all' || scope === 'discovery') {
      this.isStoredDiscoveryStateInvalidated = true;
      this.discoveredState = undefined;
    }
  }

  saveDiscoveryState(discoveryState: OAuthDiscoveryState): void {
    this.discoveredState = discoveryState;
  }

  discoveryState(): OAuthDiscoveryState | undefined {
    if (isDefined(this.discoveredState)) {
      return this.discoveredState;
    }

    return this.options.shouldReuseStoredDiscoveryState &&
      !this.isStoredDiscoveryStateInvalidated
      ? this.options.storedClient?.discoveryState
      : undefined;
  }

  getClientToPersist(): Omit<OAuthDiscoveryStoredClient, 'redirectUri'> | null {
    const clientInformation = this.clientInformation();
    const discoveryState = this.discoveryState();

    if (!isDefined(clientInformation) || !isDefined(discoveryState)) {
      return null;
    }

    return {
      registrationMethod: this.getRegistrationMethod(clientInformation),
      discoveryState,
      clientInformation: {
        redirect_uris: [this.options.redirectUrl],
        ...clientInformation,
      },
    };
  }

  private getRegistrationMethod(
    clientInformation: OAuthClientInformationMixed,
  ): OAuthDiscoveryRegistrationMethod {
    return clientInformation.client_id === this.options.clientMetadataUrl
      ? 'CLIENT_ID_METADATA_DOCUMENT'
      : 'DYNAMIC_CLIENT_REGISTRATION';
  }

  private isStoredClientUsable(): boolean {
    const { storedClient, redirectUrl, clientMetadataUrl, now } = this.options;

    if (!isDefined(storedClient) || storedClient.redirectUri !== redirectUrl) {
      return false;
    }

    const currentAuthorizationServerUrl =
      this.discoveryState()?.authorizationServerUrl;

    if (
      currentAuthorizationServerUrl !==
      storedClient.discoveryState.authorizationServerUrl
    ) {
      return false;
    }

    if (storedClient.registrationMethod === 'CLIENT_ID_METADATA_DOCUMENT') {
      return storedClient.clientInformation.client_id === clientMetadataUrl;
    }

    const secretExpiresAt =
      storedClient.clientInformation.client_secret_expires_at;

    return (
      !isDefined(secretExpiresAt) ||
      secretExpiresAt === 0 ||
      secretExpiresAt * 1000 > now.getTime()
    );
  }
}
