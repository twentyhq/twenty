import { Field, ObjectType } from '@nestjs/graphql';

import { ProductDTO } from 'src/engine/core-modules/billing/dto/product.dto';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

@ObjectType()
export class PlanInformationDTO {
  @Field(() => BillingPlanKey)
  planKey: BillingPlanKey;

  @Field(() => ProductDTO)
  baseProduct: ProductDTO;

  @Field(() => [ProductDTO])
  otherLicensedProducts: ProductDTO[];

  @Field(() => [ProductDTO])
  meteredProducts: ProductDTO[];
}
