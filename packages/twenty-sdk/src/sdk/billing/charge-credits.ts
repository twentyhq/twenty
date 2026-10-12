import {
  DEFAULT_API_URL_NAME,
  type UsageOperationTypeValue,
} from 'twenty-shared/application';

import { getApplicationAccessToken } from '@/sdk/utils/get-application-access-token';

const BILLING_CHARGE_TIMEOUT_MS = 5_000;

export type ChargeCreditsParams = {
  creditsUsedMicro: number;
  quantity?: number;
  // Who the spend belongs to when no user triggered the run (webhook, cron); ignored otherwise
  userWorkspaceId?: string;
} & (
  | {
      // An operation declared in the manifest's `billing.operations`; the platform resolves its category and label
      operation: string;
      operationType?: never;
      resourceContext?: never;
    }
  | {
      // For applications that declare no billable operations: names the platform billing category directly
      operationType: UsageOperationTypeValue;
      operation?: never;
      resourceContext?: string;
    }
);

// No-ops without an API URL or access token, and never throws: a billing error must not fail a tool
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
