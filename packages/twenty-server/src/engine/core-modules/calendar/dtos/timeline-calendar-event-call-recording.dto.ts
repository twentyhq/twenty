import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';

registerEnumType(CallRecordingStatus, {
  name: 'CallRecordingStatus',
  description: 'Recording lifecycle status',
});

@ObjectType('TimelineCalendarEventCallRecording')
export class TimelineCalendarEventCallRecordingDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => CallRecordingStatus)
  status: CallRecordingStatus;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId: string | null;
}
