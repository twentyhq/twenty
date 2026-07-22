import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { AppKeyValueScope } from 'src/engine/core-modules/application/application-key-value/enums/app-key-value-scope.enum';

@InputType('SetAppKeyValueInput')
export class SetAppKeyValueInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  key: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  value?: unknown;

  @IsEnum(AppKeyValueScope)
  @IsOptional()
  @Field(() => AppKeyValueScope, {
    nullable: true,
    defaultValue: AppKeyValueScope.WORKSPACE,
  })
  scope?: AppKeyValueScope;
}
