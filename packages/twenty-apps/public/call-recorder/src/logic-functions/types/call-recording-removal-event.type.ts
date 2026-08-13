import {
  type DatabaseEventPayload,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
} from 'twenty-sdk/define';

import { type RemovedCallRecordingRecallFields } from 'src/logic-functions/types/removed-call-recording-recall-fields.type';

export type CallRecordingRemovalEvent = DatabaseEventPayload<
  | ObjectRecordDeleteEvent<RemovedCallRecordingRecallFields>
  | ObjectRecordDestroyEvent<RemovedCallRecordingRecallFields>
>;
