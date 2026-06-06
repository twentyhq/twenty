import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type CalendarEventRecordingPreference } from 'src/engine/core-modules/calendar/types/calendar-event-recording-preference.type';

@ObjectType('CalendarEventRecordingPreference')
export class CalendarEventRecordingPreferenceDTO {
  @Field(() => UUIDScalarType)
  calendarEventId: string;

  @Field(() => String)
  recordingPreference: CalendarEventRecordingPreference;
}
