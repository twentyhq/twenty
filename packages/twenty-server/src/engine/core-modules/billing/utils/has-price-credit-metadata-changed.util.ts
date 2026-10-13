/* @license Enterprise */

import { type BillingPriceMetadata } from 'src/engine/core-modules/billing/types/billing-price-metadata.type';

// Both amounts are cached in currentBillingSubscription, which nothing else refreshes on a price edit
export const hasPriceCreditMetadataChanged = ({
  previousMetadata,
  nextMetadata,
}: {
  previousMetadata: BillingPriceMetadata | null | undefined;
  nextMetadata: BillingPriceMetadata;
}): boolean =>
  previousMetadata?.credit_amount !== nextMetadata.credit_amount ||
  previousMetadata?.member_credit_amount !== nextMetadata.member_credit_amount;
