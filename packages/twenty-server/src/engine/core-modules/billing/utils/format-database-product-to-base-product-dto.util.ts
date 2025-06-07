import { BillingProductDTO } from 'src/engine/core-modules/billing/dtos/billing-product.dto';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { formatBillingDatabasePriceToLicensedPriceDTO } from 'src/engine/core-modules/billing/utils/format-database-product-to-graphql-dto.util';
import { getMarketingFeaturesList } from 'src/engine/core-modules/billing/utils/get-product-marketing-features-list.util';

export const formatBillingDatabaseProductToBaseProductDTO = ({
  billingProduct: {
    name,
    description,
    images,
    marketingFeatures,
    metadata,
    billingPrices,
  },
}: BillingSubscriptionItem): BillingProductDTO => ({
  name,
  description,
  images,
  prices: billingPrices.map(formatBillingDatabasePriceToLicensedPriceDTO),
  marketingFeatures: getMarketingFeaturesList(marketingFeatures),
  metadata: metadata,
});
