import { Field, HideField, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { ModelConfiguration } from 'src/engine/metadata-modules/ai/ai-agent/types/modelConfiguration';
import { ModelId } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { AgentResponseFormatJson } from 'src/engine/metadata-modules/ai/ai-agent/validators/agent-response-format-json.validator';
import { AgentResponseFormatText } from 'src/engine/metadata-modules/ai/ai-agent/validators/agent-response-format-text.validator';

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

  @IsOptional()
  @ValidateNested()
  @Type(() => Object, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'type',
      subTypes: [
        { value: AgentResponseFormatText, name: 'text' },
        { value: AgentResponseFormatJson, name: 'json' },
      ],
    },
  })
  @Field(() => GraphQLJSON, { nullable: true })
  responseFormat?: AgentResponseFormat;

  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  modelConfiguration?: ModelConfiguration;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true })
  evaluationInputs?: string[];

  @HideField()
  standardId?: string;

  @HideField()
  applicationId?: string;
}
