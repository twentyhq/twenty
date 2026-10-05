import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type InputJsonSchema,
  jsonSchemaToInputSchema,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_SYNC_CALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { hydrateFathomMeeting } from 'src/logic-functions/utils/hydrate-fathom-meeting.util';
import { listFathomConnectionsForRequest } from 'src/logic-functions/utils/list-fathom-connections-for-request.util';
import { listFathomMeetings } from 'src/logic-functions/utils/list-fathom-meetings.util';
import { serializeFathomMeeting } from 'src/logic-functions/utils/serialize-fathom-meeting.util';
import { syncFathomMeetingToCallRecording } from 'src/logic-functions/utils/sync-fathom-meeting-to-call-recording.util';

const fathomSyncCallInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    recordingId: {
      type: 'integer',
      label: 'Fathom recording ID',
      description:
        'The numeric recording_id of the Fathom meeting, as returned by List Fathom Calls By Participant or shown at the end of the Fathom call URL.',
    },
  },
  required: ['recordingId'],
  additionalProperties: false,
};

type FathomSyncCallResult =
  | {
      success: true;
      recordingId: number;
      callRecordingId: string;
      calendarEventId?: string;
      created: boolean;
    }
  | { success: false; error: string };

export const fathomSyncCallHandler = async (
  parameters: { recordingId?: unknown },
  context: LogicFunctionExecutionContext,
): Promise<FathomSyncCallResult> => {
  const recordingId = parameters.recordingId;

  if (typeof recordingId !== 'number' || !Number.isSafeInteger(recordingId)) {
    return { success: false, error: 'recordingId must be an integer' };
  }

  const connections = await listFathomConnectionsForRequest(context);

  if (connections.length === 0) {
    return {
      success: false,
      error:
        'Fathom is not connected for this user. Open the Fathom app settings and add a connection first.',
    };
  }

  for (const connection of connections) {
    const fathomClient = createFathomClient(connection.accessToken);
    const meetings = await listFathomMeetings({
      fathomClient,
      stopWhen: (listedMeetings) =>
        listedMeetings.some((meeting) => meeting.recordingId === recordingId),
    });
    const meeting = meetings.find(
      (listedMeeting) => listedMeeting.recordingId === recordingId,
    );

    if (!isDefined(meeting)) {
      continue;
    }

    const syncResult = await syncFathomMeetingToCallRecording({
      coreApiClient: new CoreApiClient({ runAs: 'application' }),
      meeting: await hydrateFathomMeeting({
        fathomClient,
        serializedMeeting: serializeFathomMeeting(meeting),
      }),
      connectedAccountId: connection.id,
      retryMedia: true,
    });

    return { success: true, recordingId, ...syncResult };
  }

  return {
    success: false,
    error: `No accessible Fathom recording found for ${recordingId}`,
  };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_SYNC_CALL_UNIVERSAL_IDENTIFIER,
  name: 'fathom-sync-call',
  description:
    'Sync one Fathom recording into a CallRecording on demand: fetches its transcript, summary and action items and upserts them onto the record linked to the matching CalendarEvent. Useful to recover a missed webhook or to sync from a workflow.',
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
