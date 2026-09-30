import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import {
  APPLICATION_VARIABLE_SCOPES,
  type ApplicationVariableOption,
  type ApplicationVariableScope,
} from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

const ApplicationVariableScopeEnum = {
  WORKSPACE: 'WORKSPACE',
  USER: 'USER',
} as const satisfies { [P in ApplicationVariableScope]: P };

registerEnumType(ApplicationVariableScopeEnum, {
  name: 'ApplicationVariableScope',
});

@ObjectType('ApplicationVariable')
export class ApplicationVariableEntityDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @Field()
  key: string;

  @IsString()
  @Field()
  value: string;

  @IsString()
  @Field()
  description: string;

  @IsString()
  @Field()
  label: string;

  @IsBoolean()
  @Field()
  isSecret: boolean;

  @IsBoolean()
  @Field()
  isDeprecated: boolean;

  @IsBoolean()
  @Field()
  isRequired: boolean;

  @IsString()
  @Field()
  type: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  options?: ApplicationVariableOption[] | null;

  @IsIn(APPLICATION_VARIABLE_SCOPES)
  @Field(() => ApplicationVariableScopeEnum)
  scope: ApplicationVariableScope;
}
