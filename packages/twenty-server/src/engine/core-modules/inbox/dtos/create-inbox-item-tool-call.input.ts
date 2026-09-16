import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { InboxItemFieldType } from 'src/engine/core-modules/inbox/enums/inbox-item-field-type.enum';

@InputType()
export class InboxItemFieldInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  key: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  label: string;

  @Field(() => InboxItemFieldType)
  @IsEnum(InboxItemFieldType)
  type: InboxItemFieldType;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

// A call a person adds to a plan themselves, most often a reply typed by
// hand. It takes the shape a producer proposes one in, so what ran is on the
// same record whether an agent or a person wrote it.
@InputType()
export class CreateInboxItemToolCallInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  inboxItemId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  toolName: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field(() => [InboxItemFieldInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InboxItemFieldInput)
  inputSchema?: InboxItemFieldInput[];

  @Field(() => GraphQLJSON)
  proposedInput: Record<string, unknown>;
}
