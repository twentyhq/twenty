import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('GettingStartedWorkflowPreviewTrigger')
export class GettingStartedWorkflowPreviewTriggerDTO {
  @Field(() => String)
  type: string;

  @Field(() => String, { nullable: true })
  databaseEventAction: string | null;

  @Field(() => String)
  title: string;
}
