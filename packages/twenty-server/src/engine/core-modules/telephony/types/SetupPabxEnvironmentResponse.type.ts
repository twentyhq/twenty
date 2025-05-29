import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SetupPabxEnvironmentResponseType {
  @Field(() => Boolean)
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => ID, { nullable: true })
  companyId?: number;

  @Field(() => ID, { nullable: true })
  trunkId?: number;

  @Field(() => ID, { nullable: true })
  dialingPlanId?: number;
}
