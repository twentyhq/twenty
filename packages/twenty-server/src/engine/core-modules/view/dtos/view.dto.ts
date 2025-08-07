import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';

registerEnumType(ViewOpenRecordIn, { name: 'ViewOpenRecordIn' });
registerEnumType(ViewType, { name: 'ViewType' });

@ObjectType('CoreView')
export class ViewDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  name: string;

  @Field(() => UUIDScalarType, { nullable: false })
  objectMetadataId: string;

  @Field(() => ViewType, { nullable: false, defaultValue: ViewType.TABLE })
  type: ViewType;

  @Field({ nullable: true, defaultValue: 'INDEX' })
  key: string;

  @Field({ nullable: false })
  icon: string;

  @Field({ nullable: false, defaultValue: 0 })
  position: number;

  @Field({ nullable: false, defaultValue: false })
  isCompact: boolean;

  @Field(() => ViewOpenRecordIn, {
    nullable: false,
    defaultValue: ViewOpenRecordIn.SIDE_PANEL,
  })
  openRecordIn: ViewOpenRecordIn;

  @Field(() => AggregateOperations, { nullable: true })
  kanbanAggregateOperation?: AggregateOperations | null;

  @Field(() => UUIDScalarType, { nullable: true })
  kanbanAggregateOperationFieldMetadataId?: string | null;

  @Field(() => UUIDScalarType, { nullable: false })
  workspaceId: string;

  @Field(() => String, { nullable: true })
  anyFieldFilterValue?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
