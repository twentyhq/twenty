import { ArgsType, Field } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import {
  AppManifest,
  PackageJson,
} from 'src/engine/core-modules/application/types/application.types';

@ArgsType()
export class ApplicationInput {
  @Field(() => GraphQLJSON, { nullable: false })
  manifest: AppManifest;

  @Field(() => GraphQLJSON, { nullable: false })
  packageJson: PackageJson;

  @Field(() => String, { nullable: false })
  yarnLock: string;
}
