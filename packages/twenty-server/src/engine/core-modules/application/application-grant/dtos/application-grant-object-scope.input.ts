import { Field, InputType } from '@nestjs/graphql';

import { IsArray, IsBoolean, IsIn, IsOptional, IsUUID } from 'class-validator';
import {
  OBJECT_PERMISSION_ACTIONS,
  type ObjectPermissionAction,
} from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('ApplicationGrantObjectScopeInput')
export class ApplicationGrantObjectScopeInput {
  @IsIn(OBJECT_PERMISSION_ACTIONS)
  @Field(() => String)
  action: ObjectPermissionAction;

  @IsBoolean()
  @Field()
  allObjects: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @Field(() => [UUIDScalarType], { nullable: true })
  objectMetadataIds?: string[];
}
