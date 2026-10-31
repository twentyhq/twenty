import { ApiPath } from 'twenty-shared/types';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

// RFC 7591 §3.2.1 client information response; registrations made dynamically are always public clients
export const toOAuthClientInformationResponse = ({
  registration,
  issuer,
  redirectUris = registration.oAuthRedirectUris,
  scopes = registration.oAuthScopes,
  grantTypes = ['authorization_code', 'refresh_token'],
  responseTypes = ['code'],
}: {
  registration: Pick<
    ApplicationRegistrationEntity,
    'oAuthClientId' | 'name' | 'oAuthRedirectUris' | 'oAuthScopes' | 'createdAt'
  >;
  issuer: string;
  redirectUris?: string[];
  scopes?: string[];
  grantTypes?: string[];
  responseTypes?: string[];
}) => ({
  client_id: registration.oAuthClientId,
  client_name: registration.name,
  redirect_uris: redirectUris,
  grant_types: grantTypes,
  response_types: responseTypes,
  token_endpoint_auth_method: 'none',
  scope: scopes.join(' '),
  client_id_issued_at: Math.floor(registration.createdAt.getTime() / 1000),
  registration_client_uri: `${issuer}/${ApiPath.OAuth}/register/${registration.oAuthClientId}`,
});
