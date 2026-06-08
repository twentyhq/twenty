import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type SyncAction } from 'twenty-shared/metadata';

@ObjectType('WorkspaceMigration')
export class WorkspaceMigrationDTO {
  @Field(() => String)
  applicationUniversalIdentifier: string;

  @Field(() => GraphQLJSON)
  actions: SyncAction[];
}
