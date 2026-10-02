/* @license Enterprise */

import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType()
export class ObjectAccessOverviewRoleDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => Boolean)
  canRead: boolean;

  @Field(() => Boolean)
  canUpdate: boolean;

  @Field(() => Boolean)
  canSoftDelete: boolean;

  @Field(() => Boolean)
  hasRowFilter: boolean;
}

@ObjectType()
export class ObjectAccessOverviewDTO {
  @Field(() => [ObjectAccessOverviewRoleDTO])
  roles: ObjectAccessOverviewRoleDTO[];

  @Field(() => Int)
  restrictedRecordCount: number;

  @Field(() => Int)
  sharedRecordCount: number;
}
