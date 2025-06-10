import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceUrls {
  @Field(() => String, { nullable: true })
  customUrl?: string;

  @Field(() => String)
  subdomainUrl: string;
}
