import { CoreApiClient } from 'twenty-client-sdk/core';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// fathomRecordingImport is declared writability: APPLICATION, so only a request
// carrying the application's identity may write it. The engine never hands that
// identity to a caller, so a harness running outside the engine earns it the
// way any external backend would: by proving it holds the application's OAuth
// client secret.
//
// Raw GraphQL rather than the generated client, so the harness does not depend
// on which operations the pinned twenty-client-sdk happens to expose.
const metadataRequest = async <TData>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> => {
  const response = await fetch(`${process.env.TWENTY_API_URL}/metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const { data, errors } = (await response.json()) as {
    data: TData;
    errors?: { message: string }[];
  };

  if (errors?.length) {
    throw new Error(`Metadata request failed: ${errors[0].message}`);
  }

  return data;
};

// The secret is write-only once created, so obtaining one means rotating. That
// is safe here: the harness installs and uninstalls the app around the run, and
// tokens already issued survive a rotation.
const buildApplicationAccessToken = async (): Promise<string> => {
  const { findApplicationRegistrationByUniversalIdentifier: registration } =
    await metadataRequest<{
      findApplicationRegistrationByUniversalIdentifier: {
        id: string;
        oAuthClientId: string;
      } | null;
    }>(
      `query FindRegistration($universalIdentifier: String!) {
        findApplicationRegistrationByUniversalIdentifier(universalIdentifier: $universalIdentifier) {
          id
          oAuthClientId
        }
      }`,
      { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
    );

  if (registration === null) {
    throw new Error('Expected the Fathom application registration to exist');
  }

  const { rotateApplicationRegistrationClientSecret: rotation } =
    await metadataRequest<{
      rotateApplicationRegistrationClientSecret: { clientSecret: string };
    }>(
      `mutation RotateSecret($id: String!) {
        rotateApplicationRegistrationClientSecret(id: $id) {
          clientSecret
        }
      }`,
      { id: registration.id },
    );

  const response = await fetch(`${process.env.TWENTY_API_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: registration.oAuthClientId,
      client_secret: rotation.clientSecret,
    }),
  });

  const body = (await response.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!response.ok || !body.access_token) {
    throw new Error(
      `Client credentials exchange failed: ${body.error_description ?? response.statusText}`,
    );
  }

  return body.access_token;
};

let applicationAccessTokenPromise: Promise<string> | undefined;

export const createFathomApplicationCoreApiClient =
  async (): Promise<CoreApiClient> => {
    applicationAccessTokenPromise ??= buildApplicationAccessToken();

    return new CoreApiClient({
      headers: {
        Authorization: `Bearer ${await applicationAccessTokenPromise}`,
      },
    });
  };
