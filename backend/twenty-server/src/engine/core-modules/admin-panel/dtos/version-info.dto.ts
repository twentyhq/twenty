import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('VersionInfo')
export class VersionInfoDTO {
  @Field(() => String, { nullable: true })
  currentVersion?: string;

  @Field(() => String)
  latestVersion: string;
}
