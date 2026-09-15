import {
  DEFAULT_API_URL_NAME,
  type UsageOperationTypeValue,
} from 'twenty-shared/application';

import { getApplicationAccessToken } from '@/sdk/utils/get-application-access-token';

const BILLING_CHARGE_TIMEOUT_MS = 5_000;

export type ChargeCreditsParams = {
  creditsUsedMicro: number;
  quantity?: number;
  // Who the spend belongs to, for runs with no triggering user (a webhook, a
  // cron). Ignored otherwise: the token already names them.
  userWorkspaceId?: string;
} & (
  | {
      // An operation name declared in `billing.operations` on the application
      // manifest. The platform resolves its billing category and its label.
      operation: string;
      operationType?: never;
      resourceContext?: never;
    }
  | {
      // For applications that declare no billable operations: name the
      // platform billing category directly, unlabelled.
      operationType: UsageOperationTypeValue;
      operation?: never;
      resourceContext?: string;
    }
);

// Records credit usage against the running application via the Twenty
// server's `/app/billing/charge` endpoint. Reads `TWENTY_API_URL` and the
// application access token from the execution env (injected by the
// logic-function runtime). No-ops silently when either is missing so
// local/test runs don't crash. Failures are non-fatal — a billing error
// never surfaces as a tool failure.
export const chargeCredits = async ({
  creditsUsedMicro,
  quantity = 1,
  operation,
  operationType,
  resourceContext,
  userWorkspaceId,
}: ChargeCreditsParams): Promise<void> => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const token = getApplicationAccessToken();

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
          operation,
          operationType,
          resourceContext,
          userWorkspaceId,
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
