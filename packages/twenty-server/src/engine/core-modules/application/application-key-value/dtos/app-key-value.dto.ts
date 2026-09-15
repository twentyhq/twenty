import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type AppKeyValue } from 'twenty-shared/application';

import { AppKeyValueScope } from 'src/engine/core-modules/application/application-key-value/enums/app-key-value-scope.enum';

@ObjectType('AppKeyValue')
export class AppKeyValueDto implements AppKeyValue {
  @Field()
  key: string;

  @Field(() => GraphQLJSON, { nullable: true })
  value: unknown;

  @Field(() => AppKeyValueScope)
  scope: AppKeyValueScope;
}
