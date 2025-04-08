import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VersionInfo {
  @Field(() => String, { nullable: true })
  currentVersion?: string;

  @Field(() => String)
  latestVersion: string;
}
