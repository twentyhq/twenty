import {
  type ApplicationBilling,
  isApplicationBillingPrice,
} from 'twenty-shared/application';

import { type ApplicationBillingPriceDTO } from 'src/engine/core-modules/application/dtos/application-billing-price.dto';
import { toApplicationBillingPriceDto } from 'src/engine/core-modules/application/utils/to-application-billing-price-dto.util';

export const toManifestBillingPriceDtos = (
  billing: Pick<ApplicationBilling, 'prices'> | undefined,
): ApplicationBillingPriceDTO[] =>
  (billing?.prices ?? [])
    .filter(isApplicationBillingPrice)
    .map(toApplicationBillingPriceDto);
