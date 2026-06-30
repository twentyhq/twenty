import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkspaceUrls')
export class WorkspaceUrlsDTO {
  @Field(() => String, { nullable: true })
  customUrl?: string;

  @Field(() => String)
  subdomainUrl: string;
}
