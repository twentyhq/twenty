import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { IDField } from '@ptc-org/nestjs-query-graphql';
import { type ApplicationVariableOption } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplicationVariable')
export class ApplicationVariableEntityDTO {
  @IDField(() => UUIDScalarType)
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

  @IsBoolean()
  @Field()
  isSecret: boolean;

  @IsString()
  @Field()
  type: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  options?: ApplicationVariableOption[] | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  category?: string | null;

  @IsOptional()
  @IsNumber()
  @Field(() => Number, { nullable: true })
  position?: number | null;
}
