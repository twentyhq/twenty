import { RestApiClient } from 'twenty-client-sdk/rest';

import { classifyAppBillingChargeFailure } from 'src/logic-functions/data/classify-app-billing-charge-failure.util';
import { type AppBillingChargeOutcome } from 'src/logic-functions/types/app-billing-charge-outcome.type';

const APP_BILLING_CHARGE_PATH = '/app/billing/charge';
const APP_BILLING_CHARGE_TIMEOUT_MS = 5_000;

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
    return classifyAppBillingChargeFailure(error);
  }
};
