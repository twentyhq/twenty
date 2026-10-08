import {
  CREDIT_UNAVAILABLE_REASONS,
  type CreditAvailability,
  type CreditUnavailableReason,
  DEFAULT_API_URL_NAME,
} from 'twenty-shared/application';

import { getApplicationAccessToken } from '@/sdk/utils/get-application-access-token';

const CREDIT_AVAILABILITY_TIMEOUT_MS = 5_000;

// A fresh object per call, since app code could mutate a shared constant
const available = (): CreditAvailability => ({ hasAvailableCredits: true });

const parseCreditAvailability = (body: unknown): CreditAvailability | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const { hasAvailableCredits, reason } = body as {
    hasAvailableCredits?: unknown;
    reason?: unknown;
  };

  if (hasAvailableCredits === true) {
    return { hasAvailableCredits: true };
  }

  if (
    hasAvailableCredits === false &&
    CREDIT_UNAVAILABLE_REASONS.includes(reason as CreditUnavailableReason)
  ) {
    return {
      hasAvailableCredits: false,
      reason: reason as CreditUnavailableReason,
    };
  }

  return null;
};

// Fails open on timeouts or bad responses: a hint before expensive work, never an authorization decision
export const getCreditAvailability = async (): Promise<CreditAvailability> => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const token = getApplicationAccessToken();

  if (!apiUrl || !token) {
    return available();
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

      return available();
    }

    const creditAvailability = parseCreditAvailability(await response.json());

    if (creditAvailability === null) {
      console.error('getCreditAvailability: unexpected response shape');

      return available();
    }

    return creditAvailability;
  } catch (error) {
    console.error(
      `getCreditAvailability: ${error instanceof Error ? error.message : String(error)}`,
    );

    return available();
  }
};
