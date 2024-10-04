import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

import { AvailableProduct } from 'src/engine/core-modules/billing/interfaces/available-product.interface';

@ArgsType()
export class ProductInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  product: AvailableProduct;
}
