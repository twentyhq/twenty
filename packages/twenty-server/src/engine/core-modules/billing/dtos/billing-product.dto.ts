import { Field, InterfaceType, ObjectType } from '@nestjs/graphql';

import { BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';
import { BillingPriceLicensedDTO } from 'src/engine/core-modules/billing/dtos/billing-price-licensed.dto';
import { BillingPriceMeteredDTO } from 'src/engine/core-modules/billing/dtos/billing-price-metered.dto';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

@InterfaceType({
  resolveType(product: BillingProductDTO) {
    return product.metadata.productKey ===
      BillingProductKey.WORKFLOW_NODE_EXECUTION
      ? BillingMeteredProduct
      : BillingLicensedProduct;
  },
})
@ObjectType('BillingProduct')
export class BillingProductDTO {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => [String], { nullable: true })
  images: string[];

  @Field(() => BillingProductMetadata)
  metadata: BillingProductMetadata;
}

@ObjectType({ implements: BillingProductDTO })
export class BillingLicensedProduct {
  @Field(() => [BillingPriceLicensedDTO], { nullable: true })
  prices: BillingPriceLicensedDTO[] | null;
}

@ObjectType({ implements: BillingProductDTO })
export class BillingMeteredProduct {
  @Field(() => [BillingPriceMeteredDTO], { nullable: true })
  prices: BillingPriceMeteredDTO[] | null;
}
