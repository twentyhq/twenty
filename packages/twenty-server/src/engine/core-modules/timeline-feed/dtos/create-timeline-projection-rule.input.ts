import { Field, InputType } from '@nestjs/graphql';

import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateTimelineProjectionRuleInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  anchorObjectMetadataId: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  sourceObjectMetadataId: string;

  @Field(() => [UUIDScalarType])
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  linkedObjectMetadataIds: string[];
}
