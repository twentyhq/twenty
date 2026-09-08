import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { getDesktopCompanionAgenda } from 'src/logic-functions/flows/get-desktop-companion-agenda.util';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';
import { getRecallBotRecordingConfig } from 'src/logic-functions/constants/recall-bot-recording-config';
import { asRecord } from '@twentyhq/recall-utils/utils/as-record.util';
import { isDesktopAudioRecording } from 'src/logic-functions/domain/is-desktop-audio-recording.util';
import { type DesktopRecordingSession } from 'src/logic-functions/types/desktop-recording-session.type';
import { getOwnedDesktopUpload } from 'src/logic-functions/recall-api/get-owned-desktop-upload.util';

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

export const createDesktopRecordingUpload = async (
  client: CoreApiClient,
  userWorkspaceId: string,
  body: Record<string, unknown>,
) => {
  const sessionId = getSessionId(body);
  const configResult = getRecallApiConfig();
  const workspaceId = getCurrentWorkspaceId();
  if (!configResult.success || !workspaceId)
    throw new Error('Recording is not configured for this workspace.');
  const config = configResult.config;
  const existing = await getSession(client, sessionId);
  const agenda = await getDesktopCompanionAgenda(client, userWorkspaceId);
  const now = Date.now();
  const keyForUrl = (conferenceLinkUrl: unknown) =>
    computeRealMeetingKey({
      calendarEventId: '',
      iCalUid: undefined,
      startsAt: undefined,
      conferenceLinkUrl,
    });
  const currentMeetings = agenda.meetings.filter(
    (meeting) =>
      Date.parse(meeting.startsAt) - 15 * 60_000 <= now &&
      Date.parse(meeting.endsAt) + 15 * 60_000 >= now,
  );
  const matchingMeetings = currentMeetings.filter(
    (meeting) =>
      meeting.id === body.calendarEventId ||
      (typeof body.meetingUrl === 'string' &&
        meeting.url &&
        keyForUrl(meeting.url) === keyForUrl(body.meetingUrl)),
  );
  if (
    body.calendarEventId !== undefined &&
    !matchingMeetings.some((meeting) => meeting.id === body.calendarEventId)
  )
    throw new Error('This meeting is unavailable in your calendar.');
  if (matchingMeetings.some((meeting) => !meeting.recordingEnabled))
    throw new Error('Recording is disabled for this meeting.');
  // A time overlap alone cannot identify an unscheduled system-audio call.
  if (matchingMeetings.some((meeting) => meeting.usesCalendarBot))
    throw new Error(
      'A calendar bot is recording this meeting. Desktop capture would create a duplicate.',
    );
  if (existing) {
    if (
      !isDesktopAudioRecording(existing.companionSession) ||
      existing.companionSession?.userWorkspaceId !== userWorkspaceId
    )
      throw new Error('This recording session belongs to another user.');
    if (existing.status !== 'JOINING')
      throw new Error('This recording session has already started.');
    if (!existing.companionSession.sdkUploadId)
      throw new Error('Recording setup is still in progress. Please retry.');
    const upload = await getOwnedDesktopUpload(existing);
    if (!upload?.upload_token)
      throw new Error('Unable to resume recording setup.');
    return {
      callRecordingId: sessionId,
      uploadToken: upload.upload_token,
      apiUrl: new URL(config.baseUrl).origin,
    };
  }
  const calendarEventId = matchingMeetings[0]?.id;
  if (
    typeof body.title !== 'string' ||
    !body.title.trim() ||
    body.title.length > 300
  )
    throw new Error('Enter a recording title of 1–300 characters.');
  const session: DesktopRecordingSession = {
    source: 'desktop',
    media: 'audio',
    userWorkspaceId,
    platform:
      typeof body.platform === 'string'
        ? body.platform.slice(0, 100)
        : 'desktop-audio',
  };
  await client.mutation({
    createCallRecording: {
      __args: {
        data: {
          id: sessionId,
          title: body.title.trim(),
          status: 'JOINING',
          recordingRequestStatus: 'REQUESTED',
          ...(calendarEventId ? { calendarEventId } : {}),
          companionSession: session,
        },
      },
      id: true,
    },
  });
  const metadata = {
    twentyWorkspaceId: workspaceId,
    twentyCallRecordingId: sessionId,
    twentyUserWorkspaceId: userWorkspaceId,
    twentyRecordingSource: 'companion',
  };
  const upload = await recallBotApiRequest<{
    id: string;
    upload_token: string;
  }>({
    config,
    path: '/sdk_upload/',
    method: 'POST',
    maxAttempts: 1,
    body: {
      metadata,
      recording_config: {
        ...getRecallBotRecordingConfig(),
        // Transcript webhooks carry recording metadata, not SDK upload metadata.
        metadata,
        video_mixed_mp4: null,
      },
    },
  });
  if (!upload.ok || !upload.data?.id || !upload.data.upload_token) {
    await client.mutation({
      updateCallRecording: {
        __args: {
          id: sessionId,
          data: {
            status: 'FAILED',
            companionFailureReason: 'desktop_upload_creation_failed',
          },
        },
        id: true,
      },
    });
    throw new Error(
      'Recall could not prepare the recording. Please try again.',
    );
  }
  await client.mutation({
    updateCallRecording: {
      __args: {
        id: sessionId,
        data: {
          companionSession: { ...session, sdkUploadId: upload.data.id },
        },
      },
      id: true,
    },
  });
  return {
    callRecordingId: sessionId,
    uploadToken: upload.data.upload_token,
    apiUrl: new URL(config.baseUrl).origin,
  };
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
