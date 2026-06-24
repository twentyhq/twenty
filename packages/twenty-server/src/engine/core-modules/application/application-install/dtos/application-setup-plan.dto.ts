import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ApplicationSetupPlanItem')
export class ApplicationSetupPlanItemDTO {
  @Field(() => String)
  type: string;

  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  isRequired: boolean;

  @Field(() => Boolean)
  canApplyAutomatically: boolean;
}

@ObjectType('ApplicationSetupPlan')
export class ApplicationSetupPlanDTO {
  @Field(() => [ApplicationSetupPlanItemDTO])
  items: ApplicationSetupPlanItemDTO[];

  @Field(() => Boolean)
  requiresManualSetup: boolean;
}
