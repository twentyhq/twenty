import {
  type CreditAvailability,
  DEFAULT_API_URL_NAME,
} from 'twenty-shared/application';

import { getApplicationAccessToken } from '@/sdk/utils/get-application-access-token';

const CREDIT_AVAILABILITY_TIMEOUT_MS = 5_000;

const AVAILABLE: CreditAvailability = { hasAvailableCredits: true };

// Asks whether the workspace can still spend, so an app can stop before doing
// expensive work rather than finding out when a downstream call it did not
// write throws. Mirrors the gate the platform applies to AI, workflows and
// email.
//
// Fails open, like the platform's own usage read: a timeout or an unreachable
// server reports credits available rather than stopping an app over an
// infrastructure hiccup. An app must not treat this as an authorization
// decision, only as a hint worth honouring.
export const getCreditAvailability = async (): Promise<CreditAvailability> => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const token = getApplicationAccessToken();

  if (!apiUrl || !token) {
    return AVAILABLE;
  }

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/$/, '')}/app/billing/credits`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(CREDIT_AVAILABILITY_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      console.error(
        `getCreditAvailability: ${response.status} ${response.statusText}`,
      );

      return AVAILABLE;
    }

    const body: unknown = await response.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      typeof (body as CreditAvailability).hasAvailableCredits !== 'boolean'
    ) {
      console.error('getCreditAvailability: unexpected response shape');

      return AVAILABLE;
    }

    return body as CreditAvailability;
  } catch (error) {
    console.error(
      `getCreditAvailability: ${error instanceof Error ? error.message : String(error)}`,
    );

    return AVAILABLE;
  }
};
