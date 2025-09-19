/* @license Enterprise */

import { createUnionType } from '@nestjs/graphql';

import { BillingPriceLicensedDTO } from 'src/engine/core-modules/billing/dtos/billing-price-licensed.dto';
import { BillingPriceMeteredDTO } from 'src/engine/core-modules/billing/dtos/billing-price-metered.dto';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
export const BillingPriceUnionDTO = createUnionType({
  name: 'BillingPriceUnionDTO',
  types: () => [BillingPriceLicensedDTO, BillingPriceMeteredDTO],
  resolveType(value) {
    if (value.priceUsageType === BillingUsageType.LICENSED) {
      return BillingPriceLicensedDTO;
    }

    return BillingPriceMeteredDTO;
  },
});
