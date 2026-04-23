import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateWebhookInputUpdates {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  targetUrl?: string;

  @IsOptional()
  @IsArray()
  @Field(() => [String], { nullable: true })
  operations?: string[];

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  secret?: string;
}

@InputType()
export class UpdateWebhookInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the webhook to update',
  })
  id: string;

  @Type(() => UpdateWebhookInputUpdates)
  @ValidateNested()
  @Field(() => UpdateWebhookInputUpdates, {
    description: 'The webhook fields to update',
  })
  update: UpdateWebhookInputUpdates;
}
