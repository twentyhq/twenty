import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class InstallApplicationFromUrlInput {
  @Field(() => String, {
    nullable: false,
    description: 'URL of the tarball to install',
  })
  url: string;

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: 'Force reinstall if application already exists',
  })
  force?: boolean;
}
