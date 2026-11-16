import { type OAuthDiscoveryState } from '@modelcontextprotocol/sdk/client/auth.js';
import { type OAuthClientInformationFull } from '@modelcontextprotocol/sdk/shared/auth.js';

import { type OAuthDiscoveryRegistrationMethod } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-registration-method.type';

export type OAuthDiscoveryStoredClient = {
  registrationMethod: OAuthDiscoveryRegistrationMethod;
  redirectUri: string;
  discoveryState: OAuthDiscoveryState;
  clientInformation: OAuthClientInformationFull;
};
