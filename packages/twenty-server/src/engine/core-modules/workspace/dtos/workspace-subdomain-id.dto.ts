import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceSubdomainHostnameAndId {
  @Field()
  subdomain: string;

  @Field()
  id: string;

  @Field(() => String, { nullable: true })
  hostname?: string;
}
