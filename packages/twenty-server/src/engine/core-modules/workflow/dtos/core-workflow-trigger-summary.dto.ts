import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('CoreWorkflowTriggerSummary')
export class CoreWorkflowTriggerSummaryDTO {
  @Field(() => String)
  type: string;

  @Field(() => String, { nullable: true })
  databaseEventName: string | null;
}
