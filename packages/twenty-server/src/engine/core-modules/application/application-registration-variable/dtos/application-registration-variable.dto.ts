import { Field, ObjectType } from '@nestjs/graphql';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { IDField } from '@ptc-org/nestjs-query-graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { type ApplicationVariableOption } from 'twenty-shared/application';

@ObjectType()
export class ApplicationRegistrationVariableDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @IsString()
  @Field()
  key: string;

  @IsString()
  @Field(() => String, { nullable: true })
  value?: string | null;

  @IsString()
  @Field()
  description: string;

  @IsBoolean()
  @Field()
  isSecret: boolean;

  @IsBoolean()
  @Field()
  isRequired: boolean;

  @IsBoolean()
  @Field()
  isFilled: boolean;

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

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
