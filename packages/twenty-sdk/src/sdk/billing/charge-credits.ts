import {
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application';

const BILLING_CHARGE_TIMEOUT_MS = 5_000;

export type ChargeCreditsParams = {
  creditsUsedMicro: number;
  operationType: string;
  quantity?: number;
  resourceContext?: string;
};

// Records credit usage against the running application via the Twenty
// server's `/app/billing/charge` endpoint. Reads `TWENTY_API_URL` and
// `TWENTY_APP_ACCESS_TOKEN` from the execution env (injected by the
// logic-function runtime). No-ops silently when either is missing so
// local/test runs don't crash. Failures are non-fatal — a billing error
// never surfaces as a tool failure.
export const chargeCredits = async ({
  creditsUsedMicro,
  operationType,
  quantity = 1,
  resourceContext,
}: ChargeCreditsParams): Promise<void> => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const token = process.env[DEFAULT_APP_ACCESS_TOKEN_NAME];

  if (!apiUrl || !token) {
    return;
  }

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/$/, '')}/app/billing/charge`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditsUsedMicro,
          quantity,
          operationType,
          resourceContext,
        }),
        signal: AbortSignal.timeout(BILLING_CHARGE_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');

      console.error(
        `chargeCredits: ${response.status} ${response.statusText}: ${body}`,
      );
    }
  } catch (error) {
    console.error(
      `chargeCredits: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
