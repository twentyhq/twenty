import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateAndConnectJunctionRecordInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  sourceRecordId: string;

  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  relationFieldMetadataId: string;

  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  targetObjectMetadataId: string;

  @Field(() => GraphQLJSON)
  @IsObject()
  targetRecordInput: Record<string, unknown>;
}
