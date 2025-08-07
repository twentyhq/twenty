import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import {
  RawJSONScalar,
  UUIDScalarType,
} from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFilterOperand } from 'src/engine/core-modules/view/enums/view-filter-operand';
import { ViewFilterValue } from 'src/engine/core-modules/view/types/view-filter-value.type';

registerEnumType(ViewFilterOperand, {
  name: 'ViewFilterOperand',
});

@ObjectType('CoreViewFilter')
export class ViewFilterDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field({ nullable: false, defaultValue: ViewFilterOperand.CONTAINS })
  operand: ViewFilterOperand;

  @Field(() => RawJSONScalar, { nullable: false })
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
