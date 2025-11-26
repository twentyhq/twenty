import { Field, HideField, InputType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ModelId } from 'src/engine/metadata-modules/ai-models/constants/ai-models.const';
import { ModelConfiguration } from 'src/engine/metadata-modules/ai-agent/types/modelConfiguration';

@InputType()
export class CreateAgentInput {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  name?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  prompt: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  modelId: ModelId;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string;

  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  responseFormat?: object;

  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  modelConfiguration?: ModelConfiguration;

  @HideField()
  standardId?: string;

  @HideField()
  applicationId?: string;
}
