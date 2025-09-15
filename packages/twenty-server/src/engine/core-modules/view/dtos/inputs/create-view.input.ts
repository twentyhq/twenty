import { Field, InputType } from '@nestjs/graphql';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewCalendarLayout } from 'src/engine/core-modules/view/enums/view-calendar-layout.enum';
import { ViewKey } from 'src/engine/core-modules/view/enums/view-key.enum';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';

@InputType()
export class CreateViewInput {
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @Field({ nullable: false })
  name: string;

  @Field(() => UUIDScalarType, { nullable: false })
  objectMetadataId: string;

  @Field(() => ViewType, { nullable: true, defaultValue: ViewType.TABLE })
  type?: ViewType;

  @Field(() => ViewKey, { nullable: true })
  key?: ViewKey;

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

  @Field(() => ViewCalendarLayout, { nullable: true })
  calendarLayout?: ViewCalendarLayout;

  @Field(() => UUIDScalarType, { nullable: true })
  calendarFieldMetadataId?: string;
}
