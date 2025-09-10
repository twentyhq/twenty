import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('Application')
export class ApplicationDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  standardId?: string;

  @IsString()
  @Field(() => String)
  label: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  description?: string | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  version?: string | null;

  @IsString()
  @Field(() => String)
  sourceType: string;

  @IsString()
  @Field(() => String)
  sourcePath: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  workspaceId: string;

  @IsDateString()
  @Field(() => Date)
  createdAt: Date;

  @IsDateString()
  @Field(() => Date)
  updatedAt: Date;
}
