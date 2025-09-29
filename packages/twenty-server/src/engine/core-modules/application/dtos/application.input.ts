import { ArgsType, Field } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import {
  AppManifest,
  PackageJson,
} from 'src/engine/core-modules/application/types/application.types';

@ArgsType()
export class ApplicationInput {
  @Field(() => graphqlTypeJson)
  manifest: AppManifest;

  @Field(() => graphqlTypeJson)
  packageJson: PackageJson;

  @Field(() => String)
  yarnLock: string;
}
