import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TriggerUpgradeApplicationJobResult')
export class TriggerUpgradeApplicationJobResultDTO {
  @Field()
  jobId: string;
}
