import { Field, InputType } from '@nestjs/graphql';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';

// TODO: this should be refactored like for view-field.input.ts
// This is a temporary fix as we were extending the CreateViewInput class which was adding default values for the non filled fields
@InputType()
export class UpdateViewInput {
  @Field(() => UUIDScalarType, { nullable: true })
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => ViewType, { nullable: true })
  type?: ViewType;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  position?: number;

  @Field({ nullable: true })
  isCompact?: boolean;

  @Field(() => ViewOpenRecordIn, {
    nullable: true,
  })
  openRecordIn?: ViewOpenRecordIn;

  @Field(() => AggregateOperations, { nullable: true })
  kanbanAggregateOperation?: AggregateOperations;

  @Field(() => UUIDScalarType, { nullable: true })
  kanbanAggregateOperationFieldMetadataId?: string;

  @Field({ nullable: true })
  anyFieldFilterValue?: string;
}
