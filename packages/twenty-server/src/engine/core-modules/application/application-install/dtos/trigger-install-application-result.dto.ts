import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TriggerInstallApplicationResult')
export class TriggerInstallApplicationResultDTO {
  @Field()
  jobId: string;
}
