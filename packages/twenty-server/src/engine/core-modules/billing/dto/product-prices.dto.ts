import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ProductPriceDTO } from 'src/engine/core-modules/billing/dto/product-price.dto';

@ObjectType()
export class ProductPricesDTO {
  @Field(() => Int)
  totalNumberOfPrices: number;

  @Field(() => [ProductPriceDTO])
  productPrices: ProductPriceDTO[];
}
