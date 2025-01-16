import { createUnionType } from '@nestjs/graphql';

import { PriceLicensedDTO } from 'src/engine/core-modules/billing/dto/price-licensed.dto';
import { PriceMeteredDTO } from 'src/engine/core-modules/billing/dto/price-metered.dto';

export const PriceUnionDTO = createUnionType({
  name: 'PriceUnionDTO',
  types: () => [PriceLicensedDTO, PriceMeteredDTO],
  resolveType(value) {
    if ('unitAmount' in value) {
      return PriceLicensedDTO;
    }

    return PriceMeteredDTO;
  },
});
