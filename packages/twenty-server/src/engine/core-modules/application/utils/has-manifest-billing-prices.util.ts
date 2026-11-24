import {
  type ApplicationBilling,
  isApplicationBillingPrice,
} from 'twenty-shared/application';

export const hasManifestBillingPrices = (
  billing: Pick<ApplicationBilling, 'prices'> | undefined,
): boolean => (billing?.prices ?? []).some(isApplicationBillingPrice);
