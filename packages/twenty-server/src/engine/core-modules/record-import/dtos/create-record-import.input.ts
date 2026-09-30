import { Field, InputType } from '@nestjs/graphql';

import { IsString, IsUUID, MaxLength } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateRecordImportInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  fileId: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  objectMetadataId: string;

  // IANA zone dates without an explicit offset are read in
  @Field(() => String)
  @IsString()
  @MaxLength(64)
  timeZone: string;

  @Field(() => String)
  @IsString()
  @MaxLength(255)
  fileName: string;
}
