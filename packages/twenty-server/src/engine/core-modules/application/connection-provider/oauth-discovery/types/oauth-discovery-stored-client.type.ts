import {
  type OAuthClientInformationFull,
  type OAuthDiscoveryState,
} from '@modelcontextprotocol/client';

import { type OAuthDiscoveryRegistrationMethod } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-registration-method.type';

export type OAuthDiscoveryStoredClient = {
  registrationMethod: OAuthDiscoveryRegistrationMethod;
  redirectUri: string;
  discoveryState: OAuthDiscoveryState;
  clientInformation: OAuthClientInformationFull;
};
