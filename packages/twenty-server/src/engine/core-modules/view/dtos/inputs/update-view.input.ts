import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewCalendarLayout } from 'src/engine/core-modules/view/enums/view-calendar-layout.enum';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';

// TODO: this should be refactored like for view-field.input.ts
// This is a temporary fix as we were extending the CreateViewInput class which was adding default values for the non filled fields
@InputType()
export class UpdateViewInput {
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  id: string;

  @IsOptional()
  @IsNotEmpty()
  @IsValidMetadataName()
  @Field({ nullable: true })
  name?: string;

  @IsOptional()
  @IsEnum(ViewType)
  @Field(() => ViewType, { nullable: true })
  type?: ViewType;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  icon?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  position?: number;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isCompact?: boolean;

  @IsOptional()
  @IsEnum(ViewOpenRecordIn)
  @Field(() => ViewOpenRecordIn, {
    nullable: true,
  })
  openRecordIn?: ViewOpenRecordIn;

  @IsOptional()
  @IsEnum(AggregateOperations)
  @Field(() => AggregateOperations, { nullable: true })
  kanbanAggregateOperation?: AggregateOperations;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  kanbanAggregateOperationFieldMetadataId?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  anyFieldFilterValue?: string;

  @IsOptional()
  @IsEnum(ViewCalendarLayout)
  @Field(() => ViewCalendarLayout, { nullable: true })
  calendarLayout?: ViewCalendarLayout;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  calendarFieldMetadataId?: string;
}
