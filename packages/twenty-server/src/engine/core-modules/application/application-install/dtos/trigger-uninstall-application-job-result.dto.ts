import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TriggerUninstallApplicationJobResult')
export class TriggerUninstallApplicationJobResultDTO {
  @Field()
  jobId: string;
}
