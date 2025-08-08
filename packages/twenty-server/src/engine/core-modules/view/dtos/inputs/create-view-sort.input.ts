import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewSortDirection } from 'src/engine/core-modules/view/enums/view-sort-direction';

@InputType()
export class CreateViewSortInput {
  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field(() => ViewSortDirection, {
    nullable: true,
    defaultValue: ViewSortDirection.ASC,
  })
  direction?: ViewSortDirection;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;
}
