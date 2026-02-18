import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class WorkspaceMigrationDTO {
  @Field(() => String)
  applicationUniversalIdentifier: string;

  @Field(() => GraphQLJSON)
  actions: unknown[];
}
