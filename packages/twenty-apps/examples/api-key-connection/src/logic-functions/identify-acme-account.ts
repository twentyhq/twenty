import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type IdentifyAccountPayload,
  type IdentifyAccountResult,
} from 'twenty-sdk/logic-function';

import { ACME_WHOAMI_URL } from 'src/constants/acme';
import { IDENTIFY_ACME_ACCOUNT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type AcmeWhoami = { authenticated: boolean; token: string };

// Throwing rejects the key: Twenty shows "The API key was rejected" and saves nothing.
const handler = async ({
  accessToken,
}: IdentifyAccountPayload): Promise<IdentifyAccountResult> => {
  const response = await fetch(ACME_WHOAMI_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Acme rejected the API key (HTTP ${response.status})`);
  }

  const whoami = (await response.json()) as AcmeWhoami;

  return {
    externalAccountId: whoami.token,
    handle: `Acme key ending ${accessToken.slice(-4)}`,
  };
};

export default defineLogicFunction({
  universalIdentifier: IDENTIFY_ACME_ACCOUNT_UNIVERSAL_IDENTIFIER,
  name: 'identify-acme-account',
  description: 'Validates an Acme API key and identifies its account',
  timeoutSeconds: 10,
  handler,
});
