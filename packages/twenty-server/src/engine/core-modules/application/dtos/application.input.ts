import { ArgsType, Field } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { Manifest, PackageJson } from 'twenty-shared/application';

@ArgsType()
export class ApplicationInput {
  @Field(() => GraphQLJSON, { nullable: false })
  manifest: Manifest;

  @Field(() => GraphQLJSON, { nullable: false })
  packageJson: PackageJson;

  @Field(() => String, { nullable: false })
  yarnLock: string;
}
