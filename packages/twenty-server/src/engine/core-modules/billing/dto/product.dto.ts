import { Field, ObjectType } from '@nestjs/graphql';

import { PriceLicensedDTO } from 'src/engine/core-modules/billing/dto/price-licensed.dto';
import { PriceMeteredDTO } from 'src/engine/core-modules/billing/dto/price-metered.dto';
import { PriceUnionDTO } from 'src/engine/core-modules/billing/dto/price-union.dto';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

@ObjectType()
export class ProductDTO {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => [String], { nullable: true })
  images: string[];

  @Field(() => BillingUsageType)
  type: BillingUsageType;

  @Field(() => [PriceUnionDTO], { nullable: 'items' })
  prices: Array<PriceLicensedDTO | PriceMeteredDTO>;
}
