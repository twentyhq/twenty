import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VersionInfo {
  @Field(() => String)
  latestVersion: string;

  @Field(() => Boolean)
  currentVersionExists: boolean;
}
