import { ArgsType, Field, Int } from '@nestjs/graphql';

import { IsInt, Min } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { Manifest } from 'twenty-shared/application';

import { type TarballPackageJson } from 'src/engine/core-modules/application/application-registration/types/tarball-package-json.type';

@ArgsType()
export class CreateApplicationTarballUploadInput {
  @Field(() => GraphQLJSON, { nullable: false })
  manifest: Manifest;

  @Field(() => GraphQLJSON, { nullable: false })
  packageJson: TarballPackageJson;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  size: number;
}
