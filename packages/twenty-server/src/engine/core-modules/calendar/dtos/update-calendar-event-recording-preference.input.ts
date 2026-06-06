import { Field, InputType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  CALENDAR_EVENT_RECORDING_PREFERENCES,
  type CalendarEventRecordingPreference,
} from 'src/engine/core-modules/calendar/types/calendar-event-recording-preference.type';

@InputType()
export class UpdateCalendarEventRecordingPreferenceInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  calendarEventId: string;

  @IsIn(CALENDAR_EVENT_RECORDING_PREFERENCES)
  @Field(() => String)
  recordingPreference: CalendarEventRecordingPreference;
}
