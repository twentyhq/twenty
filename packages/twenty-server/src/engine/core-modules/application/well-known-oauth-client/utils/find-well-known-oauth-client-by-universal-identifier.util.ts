import { WELL_KNOWN_OAUTH_CLIENTS } from 'src/engine/core-modules/application/well-known-oauth-client/constants/well-known-oauth-clients.constant';
import { type WellKnownOAuthClientDefinition } from 'src/engine/core-modules/application/well-known-oauth-client/types/well-known-oauth-client-definition.type';

export const findWellKnownOAuthClientByUniversalIdentifier = (
  universalIdentifier: string,
): WellKnownOAuthClientDefinition | undefined =>
  WELL_KNOWN_OAUTH_CLIENTS.find(
    (wellKnownOAuthClient) =>
      wellKnownOAuthClient.universalIdentifier === universalIdentifier,
  );
