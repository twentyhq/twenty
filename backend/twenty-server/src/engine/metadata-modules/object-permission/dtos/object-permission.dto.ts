import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { RestrictedFieldsPermissions } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';

@ObjectType('ObjectPermission')
export class ObjectPermissionDTO {
  @Field(() => UUIDScalarType, { nullable: false })
  objectMetadataId: string;

  @Field({ nullable: true })
  canReadObjectRecords?: boolean;

  @Field({ nullable: true })
  canUpdateObjectRecords?: boolean;

  @Field({ nullable: true })
  canSoftDeleteObjectRecords?: boolean;

  @Field({ nullable: true })
  canDestroyObjectRecords?: boolean;

  @Field(() => GraphQLJSON, {
    nullable: true,
  })
  restrictedFields?: RestrictedFieldsPermissions;

  @Field(() => [RowLevelPermissionPredicateDTO], { nullable: true })
  rowLevelPermissionPredicates?: RowLevelPermissionPredicateDTO[];

  @Field(() => [RowLevelPermissionPredicateGroupDTO], { nullable: true })
  rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupDTO[];
}
