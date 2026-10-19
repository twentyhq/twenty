import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('GettingStartedHandover')
export class GettingStartedHandoverDTO {
  @Field(() => String)
  workflowId: string;

  @Field(() => String)
  versionId: string;
}
