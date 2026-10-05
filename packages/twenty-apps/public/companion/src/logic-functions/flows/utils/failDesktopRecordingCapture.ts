import { CallRecordingStatus } from 'src/logic-functions/constants/CallRecordingStatus';
import { updateCallRecording } from 'src/logic-functions/data/utils/updateCallRecording';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { asRecord } from 'src/logic-functions/utils/asRecord';
import { type DesktopRecordingSession } from 'src/logic-functions/types/DesktopRecordingSession';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getSessionId = (body: Record<string, unknown>): string => {
  if (typeof body.sessionId !== 'string' || !UUID_PATTERN.test(body.sessionId))
    throw new Error('Invalid recording session.');
  return body.sessionId;
};

type DesktopRecord = {
  id: string;
  status: string;
  companionSession: DesktopRecordingSession | null;
};

const getSession = async (
  client: CoreApiClient,
  id: string,
): Promise<DesktopRecord | undefined> => {
  const result = await client.query({
    callRecordings: {
      __args: { first: 1, filter: { id: { eq: id } } },
      edges: {
        node: { id: true, status: true, companionSession: true },
      },
    },
  });
  return result.callRecordings?.edges?.[0]?.node as DesktopRecord | undefined;
};

export const failDesktopRecordingCapture = async (
  client: CoreApiClient,
  userWorkspaceId: string,
  body: Record<string, unknown>,
) => {
  const id = getSessionId(body);
  const recording = await getSession(client, id);
  if (
    !recording ||
    asRecord(recording.companionSession)?.userWorkspaceId !== userWorkspaceId
  )
    throw new Error('Recording is unavailable.');
  if (recording.status === 'JOINING')
    await updateCallRecording(client, {
      id,
      expectedStatuses: [CallRecordingStatus.JOINING],
      data: {
        status: CallRecordingStatus.FAILED,
        companionFailureReason: 'desktop_capture_did_not_start',
      },
    });
  return { callRecordingId: id };
};
