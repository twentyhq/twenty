import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';

const APP_BILLING_CHARGE_PATH = '/app/billing/charge';
const APP_BILLING_CHARGE_TIMEOUT_MS = 5_000;

// 'unknown' covers timeouts and unreachable billing: the charge may have
// landed server-side, so callers must treat it as charged, never retry it.
export type AppBillingChargeOutcome =
  | 'charged'
  | 'billing-disabled'
  | 'rejected'
  | 'unknown';

export const requestAppBillingCharge = async ({
  creditsUsedMicro,
  quantity,
  operationType,
  resourceContext,
}: {
  creditsUsedMicro: number;
  quantity: number;
  operationType: string;
  resourceContext: string;
}): Promise<AppBillingChargeOutcome> => {
  try {
    const client = new RestApiClient();

    await client.post(
      APP_BILLING_CHARGE_PATH,
      { creditsUsedMicro, quantity, operationType, resourceContext },
      { signal: AbortSignal.timeout(APP_BILLING_CHARGE_TIMEOUT_MS) },
    );

    return 'charged';
  } catch (error) {
    if (error instanceof RestApiClientError && error.status === 404) {
      return 'billing-disabled';
    }

    if (error instanceof RestApiClientError && error.status !== undefined) {
      return 'rejected';
    }

    return 'unknown';
  }
};
