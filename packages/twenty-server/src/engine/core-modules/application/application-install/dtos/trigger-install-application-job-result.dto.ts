import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TriggerInstallApplicationJobResult')
export class TriggerInstallApplicationJobResultDTO {
  @Field()
  jobId: string;
}
