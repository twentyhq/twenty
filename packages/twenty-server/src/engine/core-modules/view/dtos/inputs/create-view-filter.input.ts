import { Field, InputType } from '@nestjs/graphql';

import { GraphQLJSONObject } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFilterValue } from 'src/engine/core-modules/view/types/view-filter-value.type';

@InputType()
export class CreateViewFilterInput {
  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field({ nullable: true, defaultValue: 'Contains' })
  operand?: string;

  @Field(() => GraphQLJSONObject, { nullable: false })
  value: ViewFilterValue;

  @Field(() => UUIDScalarType, { nullable: true })
  viewFilterGroupId?: string;

  @Field({ nullable: true })
  positionInViewFilterGroup?: number;

  @Field({ nullable: true })
  subFieldName?: string;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;
}
