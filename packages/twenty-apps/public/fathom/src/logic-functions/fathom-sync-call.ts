import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type InputJsonSchema,
  jsonSchemaToInputSchema,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';

import { FATHOM_SYNC_CALL_UNIVERSAL_IDENTIFIER } from 'src/constants/fathom-sync-call-universal-identifier';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { getFathomConnectionForRequest } from 'src/logic-functions/utils/get-fathom-connection-for-request.util';
import { hydrateFathomMeeting } from 'src/logic-functions/utils/hydrate-fathom-meeting.util';
import { listAccessibleFathomMeetings } from 'src/logic-functions/utils/list-accessible-fathom-meetings.util';
import { serializeFathomMeeting } from 'src/logic-functions/utils/serialize-fathom-meeting.util';
import { syncFathomMeetingToCallRecording } from 'src/logic-functions/utils/sync-fathom-meeting-to-call-recording.util';

const fathomSyncCallInputSchema = {
  type: 'object',
  properties: {
    recordingId: {
      type: 'number',
      label: 'Fathom recording ID',
      description: 'The numeric recording_id returned by the Fathom API.',
    },
  },
  required: ['recordingId'],
} as const satisfies InputJsonSchema;

export const fathomSyncCallHandler = async (
  parameters: { recordingId: number },
  context: LogicFunctionExecutionContext,
) => {
  if (!Number.isSafeInteger(parameters.recordingId)) {
    return { success: false, error: 'recordingId must be an integer' };
  }

  const connection = await getFathomConnectionForRequest(context);
  const fathomClient = createFathomClient(connection.accessToken);
  const meetings = await listAccessibleFathomMeetings({
    fathomClient,
    stopWhen: (accessibleMeetings) =>
      accessibleMeetings.some(
        (meeting) => meeting.recordingId === parameters.recordingId,
      ),
  });
  const meeting = meetings.find(
    (candidateMeeting) =>
      candidateMeeting.recordingId === parameters.recordingId,
  );

  if (!meeting) {
    return {
      success: false,
      error: `No accessible Fathom recording found for ${parameters.recordingId}`,
    };
  }

  const hydratedMeeting = await hydrateFathomMeeting({
    fathomClient,
    serializedMeeting: serializeFathomMeeting(meeting),
  });
  const syncResult = await syncFathomMeetingToCallRecording({
    coreApiClient: new CoreApiClient({ runAs: 'application' }),
    meeting: hydratedMeeting,
  });

  return { success: true, recordingId: parameters.recordingId, ...syncResult };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_SYNC_CALL_UNIVERSAL_IDENTIFIER,
  name: 'fathom-sync-call',
  description:
    'Fetch an accessible Fathom recording, transcript, summary, and action items, then upsert one CallRecording linked to a conservatively matched CalendarEvent.',
  timeoutSeconds: 60,
  handler: fathomSyncCallHandler,
  toolTriggerSettings: { inputSchema: fathomSyncCallInputSchema },
  workflowActionTriggerSettings: {
    label: 'Sync Fathom Call',
    inputSchema: jsonSchemaToInputSchema(fathomSyncCallInputSchema),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          recordingId: { type: 'number' },
          callRecordingId: { type: 'string' },
          calendarEventId: { type: 'string' },
          created: { type: 'boolean' },
        },
      },
    ],
  },
});
