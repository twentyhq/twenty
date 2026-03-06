import { ArgsType, Field } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type Manifest } from 'twenty-shared/application';

@ArgsType()
export class ApplicationInput {
  @Field(() => GraphQLJSON, { nullable: false })
  manifest: Manifest;
}
