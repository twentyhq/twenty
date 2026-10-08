import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TriggerUninstallApplicationResult')
export class TriggerUninstallApplicationResultDTO {
  @Field()
  jobId: string;
}
