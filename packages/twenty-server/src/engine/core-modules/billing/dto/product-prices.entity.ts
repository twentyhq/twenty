import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ProductPriceEntity } from 'src/engine/core-modules/billing/dto/product-price.entity';

@ObjectType()
export class ProductPricesEntity {
  @Field(() => Int)
  totalNumberOfPrices: number;

  @Field(() => [ProductPriceEntity])
  productPrices: ProductPriceEntity[];
}
