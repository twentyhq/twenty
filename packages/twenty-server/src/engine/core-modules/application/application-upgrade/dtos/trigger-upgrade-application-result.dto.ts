import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TriggerUpgradeApplicationResult')
export class TriggerUpgradeApplicationResultDTO {
  @Field()
  jobId: string;
}
