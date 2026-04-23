import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  CalendarChannelContactAutoCreationPolicy,
  CalendarChannelSyncStage,
  CalendarChannelVisibility,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateCalendarChannelInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  handle: string;

  @IsEnum(CalendarChannelVisibility)
  @IsNotEmpty()
  @Field(() => CalendarChannelVisibility)
  visibility: CalendarChannelVisibility;

  @IsEnum(CalendarChannelSyncStage)
  @IsNotEmpty()
  @Field(() => CalendarChannelSyncStage)
  syncStage: CalendarChannelSyncStage;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  connectedAccountId: string;

  @IsBoolean()
  @IsNotEmpty()
  @Field()
  isContactAutoCreationEnabled: boolean;

  @IsEnum(CalendarChannelContactAutoCreationPolicy)
  @IsNotEmpty()
  @Field(() => CalendarChannelContactAutoCreationPolicy)
  contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy;

  @IsBoolean()
  @IsNotEmpty()
  @Field()
  isSyncEnabled: boolean;
}
