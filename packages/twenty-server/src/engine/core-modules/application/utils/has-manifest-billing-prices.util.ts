import {
  type ApplicationBilling,
  isApplicationBillingPrice,
} from 'twenty-shared/application';

export const hasManifestBillingPrices = (
  billing: ApplicationBilling | undefined,
): boolean => (billing?.prices ?? []).some(isApplicationBillingPrice);
