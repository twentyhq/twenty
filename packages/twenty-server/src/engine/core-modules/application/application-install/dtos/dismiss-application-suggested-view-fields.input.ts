import { Field, InputType } from '@nestjs/graphql';

import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DismissApplicationSuggestedViewFieldsInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  applicationId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  @Field(() => [UUIDScalarType])
  universalIdentifiers: string[];
}
