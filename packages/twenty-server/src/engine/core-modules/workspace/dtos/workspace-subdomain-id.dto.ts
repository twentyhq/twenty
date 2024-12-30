import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceSubdomainAndId {
  @Field()
  subdomain: string;

  @Field()
  id: string;
}
