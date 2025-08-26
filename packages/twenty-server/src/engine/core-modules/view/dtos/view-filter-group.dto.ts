import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFilterGroupLogicalOperator } from 'src/engine/core-modules/view/enums/view-filter-group-logical-operator';

registerEnumType(ViewFilterGroupLogicalOperator, {
  name: 'ViewFilterGroupLogicalOperator',
});

@ObjectType('CoreViewFilterGroup')
export class ViewFilterGroupDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: true })
  parentViewFilterGroupId?: string | null;

  @Field(() => ViewFilterGroupLogicalOperator, {
    nullable: false,
    defaultValue: ViewFilterGroupLogicalOperator.NOT,
  })
  logicalOperator: ViewFilterGroupLogicalOperator;

  @Field(() => Number, { nullable: true })
  positionInViewFilterGroup?: number | null;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @Field(() => UUIDScalarType, { nullable: false })
  workspaceId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
