import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type ApplicationVariableOption } from 'twenty-shared/application';

@ObjectType('ApplicationVariableUserValue')
export class ApplicationVariableUserValueDTO {
  @IsString()
  @Field()
  key: string;

  @IsString()
  @Field()
  label: string;

  @IsString()
  @Field()
  description: string;

  @IsString()
  @Field()
  type: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  options?: ApplicationVariableOption[] | null;

  @IsBoolean()
  @Field()
  isSecret: boolean;

  @IsBoolean()
  @Field()
  isRequired: boolean;

  @IsBoolean()
  @Field()
  isDeprecated: boolean;

  @IsString()
  @Field()
  value: string;
}
