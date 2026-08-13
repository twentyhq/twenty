import {
  type DatabaseEventPayload,
  type ObjectRecordRestoreEvent,
} from 'twenty-sdk/define';

import { type RemovedCallRecordingRecallFields } from 'src/logic-functions/types/removed-call-recording-recall-fields.type';

export type CallRecordingRestoredEvent = DatabaseEventPayload<
  ObjectRecordRestoreEvent<RemovedCallRecordingRecallFields>
>;
