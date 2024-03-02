import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ProductPriceEntity } from 'src/core/billing/dto/product-price.entity';

@ObjectType()
export class ProductPricesEntity {
  @Field(() => Int)
  totalNumberOfPrices: number;

  @Field(() => [ProductPriceEntity])
  productPrices: ProductPriceEntity[];
}
