/* @license Enterprise */

import { createUnionType } from '@nestjs/graphql';

import { BillingPriceLicensedDTO } from 'src/engine/core-modules/billing/dtos/billing-price-licensed.dto';
import { BillingPriceMeteredDTO } from 'src/engine/core-modules/billing/dtos/billing-price-metered.dto';

export const BillingPriceUnionDTO = createUnionType({
  name: 'BillingPriceUnionDTO',
  types: () => [BillingPriceLicensedDTO, BillingPriceMeteredDTO],
  resolveType(value) {
    if ('unitAmount' in value) {
      return BillingPriceLicensedDTO;
    }

    return BillingPriceMeteredDTO;
  },
});
