import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type z } from 'zod';

import { type callRecordingSyncStateNodeSchema } from 'src/logic-functions/schemas/call-recording-sync-states-query-result.schema';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { mapCallRecordingMediaState } from 'src/logic-functions/utils/map-call-recording-media-state.util';
import { isDefined } from 'src/utils/is-defined';

export const mapCallRecordingSyncState = (
  node: z.infer<typeof callRecordingSyncStateNodeSchema>,
): CallRecordingSyncState => ({
  ...mapCallRecordingMediaState(node),
  isDeleted: isNonEmptyString(node.deletedAt),
  status: node.status ?? undefined,
  title: node.title ?? undefined,
  recordingRequestStatus: node.recordingRequestStatus ?? undefined,
  startedAt: node.startedAt ?? undefined,
  endedAt: node.endedAt ?? undefined,
  hasTranscript: isNonEmptyArray(node.transcript),
  hasSummary:
    isNonEmptyString(node.summary?.markdown) ||
    isDefined(node.summary?.blocknote),
});
