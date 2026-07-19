import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('VersionInfo')
export class VersionInfoDTO {
  @Field(() => String, { nullable: true })
  currentVersion?: string;

  // Null when Docker Hub is unreachable or no numeric release tags are found.
  // Never use the docker floating tag name "latest" here — the admin UI would
  // display it as if it were a real version number.
  @Field(() => String, { nullable: true })
  latestVersion?: string | null;
}
