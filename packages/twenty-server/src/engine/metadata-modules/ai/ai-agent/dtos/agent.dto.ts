import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ModelConfiguration } from 'src/engine/metadata-modules/ai/ai-agent/types/modelConfiguration';
import { ModelId } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';

@ObjectType('Agent')
export class AgentDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: true })
  standardId?: string | null;

  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field()
  label: string;

  @IsString()
  @Field({ nullable: true })
  icon?: string;

  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  prompt: string;

  @Field(() => String)
  modelId: ModelId;

  @Field(() => GraphQLJSON, { nullable: true })
  responseFormat?: object;

  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string;

  @IsBoolean()
  @Field()
  isCustom: boolean;

  @HideField()
  workspaceId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId?: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  modelConfiguration?: ModelConfiguration;

  @Field(() => [String])
  evaluationInputs: string[];
}
