import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class workspaceUrls {
  @Field(() => String, { nullable: true })
  customUrl?: string;

  @Field(() => String)
  subdomainUrl: string;
}
