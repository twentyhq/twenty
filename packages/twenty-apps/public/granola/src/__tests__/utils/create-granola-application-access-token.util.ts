import { z } from 'zod';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const REGISTRATION_RESPONSE_SCHEMA = z.object({
  data: z.object({
    findApplicationRegistrationByUniversalIdentifier: z.object({
      id: z.string(),
      oAuthClientId: z.string(),
    }),
  }),
});
const ROTATION_RESPONSE_SCHEMA = z.object({
  data: z.object({
    rotateApplicationRegistrationClientSecret: z.object({
      clientSecret: z.string(),
    }),
  }),
});
const TOKEN_RESPONSE_SCHEMA = z.object({ access_token: z.string() });

const requestMetadata = async (
  query: string,
  variables: Record<string, unknown>,
): Promise<unknown> => {
  const response = await fetch(`${process.env.TWENTY_API_URL}/metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  return response.json();
};

export const createGranolaApplicationAccessToken =
  async (): Promise<string> => {
    const registration = REGISTRATION_RESPONSE_SCHEMA.parse(
      await requestMetadata(
        `query FindRegistration($universalIdentifier: String!) {
        findApplicationRegistrationByUniversalIdentifier(universalIdentifier: $universalIdentifier) {
          id
          oAuthClientId
        }
      }`,
        { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      ),
    ).data.findApplicationRegistrationByUniversalIdentifier;
    const { clientSecret } = ROTATION_RESPONSE_SCHEMA.parse(
      await requestMetadata(
        `mutation RotateSecret($id: String!) {
        rotateApplicationRegistrationClientSecret(id: $id) {
          clientSecret
        }
      }`,
        { id: registration.id },
      ),
    ).data.rotateApplicationRegistrationClientSecret;
    const response = await fetch(`${process.env.TWENTY_API_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: registration.oAuthClientId,
        client_secret: clientSecret,
      }),
    });

    return TOKEN_RESPONSE_SCHEMA.parse(await response.json()).access_token;
  };
