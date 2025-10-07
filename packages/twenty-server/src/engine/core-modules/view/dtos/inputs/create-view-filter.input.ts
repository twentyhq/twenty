import { Field, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { ViewFilterOperand } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFilterValue } from 'src/engine/core-modules/view/types/view-filter-value.type';

@InputType()
export class CreateViewFilterInput {
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field({ nullable: true, defaultValue: ViewFilterOperand.CONTAINS })
  operand?: ViewFilterOperand;

  @Field(() => GraphQLJSON, { nullable: false })
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
