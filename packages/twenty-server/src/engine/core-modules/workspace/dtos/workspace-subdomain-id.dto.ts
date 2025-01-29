import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceUrlAndId {
  @Field()
  workspaceUrl: string;

  @Field()
  id: string;
}
