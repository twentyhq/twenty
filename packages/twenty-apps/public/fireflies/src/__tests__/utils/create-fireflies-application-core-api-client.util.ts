import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const createFirefliesApplicationCoreApiClient =
  async (): Promise<CoreApiClient> => {
    const metadataClient = new MetadataApiClient();
    const result = await metadataClient.query({
      findApplicationRegistrationByUniversalIdentifier: {
        __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
        id: true,
        oAuthClientId: true,
      },
    });
    const registration =
      result.findApplicationRegistrationByUniversalIdentifier;
    if (!isDefined(registration)) {
      throw new Error('Application registration missing');
    }
    const rotation = await metadataClient.mutation({
      rotateApplicationRegistrationClientSecret: {
        __args: { id: registration.id },
        clientSecret: true,
      },
    });
    const response = await fetch(`${process.env.TWENTY_API_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: registration.oAuthClientId,
        client_secret:
          rotation.rotateApplicationRegistrationClientSecret.clientSecret,
      }),
    });
    const body = z
      .object({ access_token: z.string().optional() })
      .parse(await response.json());
    if (!response.ok || !isNonEmptyString(body.access_token)) {
      throw new Error('Application token exchange failed');
    }
    return new CoreApiClient({
      headers: { Authorization: `Bearer ${body.access_token}` },
    });
  };
