import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFilterValue } from 'src/engine/core-modules/view/types/view-filter-value.type';

@ObjectType('CoreViewFilter')
export class ViewFilterDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field({ nullable: false, defaultValue: 'Contains' })
  operand: string;

  @Field(() => GraphQLJSONObject, { nullable: false })
  value: ViewFilterValue;

  @Field(() => UUIDScalarType, { nullable: true })
  viewFilterGroupId?: string | null;

  @Field(() => Number, { nullable: true })
  positionInViewFilterGroup?: number | null;

  @Field(() => String, { nullable: true })
  subFieldName?: string | null;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @Field(() => UUIDScalarType, { nullable: false })
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
