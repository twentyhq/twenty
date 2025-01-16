import { Field, ObjectType } from '@nestjs/graphql';

import { PlanInformationDTO } from 'src/engine/core-modules/billing/dto/plan-information.dto';

@ObjectType()
export class PlansInformationDTO {
  @Field(() => [PlanInformationDTO])
  plans: PlanInformationDTO[];
}
