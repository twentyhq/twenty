import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type SyncAction } from 'twenty-shared/metadata';

import { type ApplicationTranslationSyncAction } from 'src/engine/core-modules/application/application-translation/types/application-translation-sync-action.type';

@ObjectType('WorkspaceMigration')
export class WorkspaceMigrationDTO {
  @Field(() => String)
  applicationUniversalIdentifier: string;

  @Field(() => GraphQLJSON)
  actions: SyncAction[];

  @Field(() => GraphQLJSON, { nullable: true })
  translationActions: ApplicationTranslationSyncAction[] | null;
}
