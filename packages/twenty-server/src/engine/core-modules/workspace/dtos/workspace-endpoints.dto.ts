import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceEndpoints {
  @Field(() => String, { nullable: true })
  customEndpoint?: string;

  @Field(() => String)
  twentyEndpoint: string;
}
