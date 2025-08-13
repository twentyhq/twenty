import { Field, InputType } from '@nestjs/graphql';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';

@InputType()
export class CreateViewInput {
  @Field({ nullable: false })
  name: string;

  @Field(() => UUIDScalarType, { nullable: false })
  objectMetadataId: string;

  @Field(() => ViewType, { nullable: true, defaultValue: ViewType.TABLE })
  type?: ViewType;

  @Field({ nullable: true, defaultValue: 'INDEX' })
  key?: string;

  @Field({ nullable: false })
  icon: string;

  @Field({ nullable: true, defaultValue: 0 })
  position?: number;

  @Field({ nullable: true, defaultValue: false })
  isCompact?: boolean;

  @Field(() => ViewOpenRecordIn, {
    nullable: true,
    defaultValue: ViewOpenRecordIn.SIDE_PANEL,
  })
  openRecordIn?: ViewOpenRecordIn;

  @Field(() => AggregateOperations, { nullable: true })
  kanbanAggregateOperation?: AggregateOperations;

  @Field(() => UUIDScalarType, { nullable: true })
  kanbanAggregateOperationFieldMetadataId?: string;

  @Field({ nullable: true })
  anyFieldFilterValue?: string;
}
