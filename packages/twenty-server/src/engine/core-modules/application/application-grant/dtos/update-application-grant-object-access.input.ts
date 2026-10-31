import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('ApplicationGrantObjectPermissionInput')
export class ApplicationGrantObjectPermissionInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canReadObjectRecords?: boolean | null;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canUpdateObjectRecords?: boolean | null;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canSoftDeleteObjectRecords?: boolean | null;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canDestroyObjectRecords?: boolean | null;
}

@InputType('UpdateApplicationGrantObjectAccessInput')
export class UpdateApplicationGrantObjectAccessInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  applicationId: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canReadAllObjectRecords?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canUpdateAllObjectRecords?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canSoftDeleteAllObjectRecords?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canDestroyAllObjectRecords?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicationGrantObjectPermissionInput)
  @Field(() => [ApplicationGrantObjectPermissionInput])
  objectPermissions: ApplicationGrantObjectPermissionInput[];
}
