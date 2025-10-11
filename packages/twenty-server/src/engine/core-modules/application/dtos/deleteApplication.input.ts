import { ArgsType, Field } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { PackageJson } from 'src/engine/core-modules/application/types/application.types';

@ArgsType()
export class DeleteApplicationInput {
  @Field(() => GraphQLJSON, { nullable: false })
  packageJson: PackageJson;
}
