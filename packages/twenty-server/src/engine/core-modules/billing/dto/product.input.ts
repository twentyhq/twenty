import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

import { AvailableProduct } from 'src/engine/core-modules/billing/enums/billing-available-product.enum';

@ArgsType()
export class ProductInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  product: AvailableProduct;
}
