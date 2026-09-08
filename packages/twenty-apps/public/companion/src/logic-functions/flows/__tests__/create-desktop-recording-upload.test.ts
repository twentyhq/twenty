import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { extractTwentyWorkspaceIdFromRecallWebhook } from 'src/logic-functions/recall-api/extract-twenty-workspace-id-from-recall-webhook.util';
import {
  createDesktopRecordingUpload,
  failDesktopRecordingCapture,
} from 'src/logic-functions/flows/create-desktop-recording-upload.util';

const { request, agenda } = vi.hoisted(() => ({
  request: vi.fn(),
  agenda: vi.fn(),
}));
vi.mock('src/logic-functions/recall-api/get-recall-api-config.util', () => ({
  getRecallApiConfig: () => ({
    success: true,
    config: {
      baseUrl: 'https://eu-central-1.recall.ai/api/v1',
      apiKey: 'server-only-test-key',
    },
  }),
}));
vi.mock('src/logic-functions/data/get-current-workspace-id.util', () => ({
  getCurrentWorkspaceId: () => 'workspace-1',
}));
vi.mock('src/logic-functions/recall-api/recall-bot-api-request.util', () => ({
  recallBotApiRequest: request,
}));
vi.mock('src/logic-functions/flows/get-desktop-companion-agenda.util', () => ({
  getDesktopCompanionAgenda: agenda,
}));

const SESSION_ID = '15fb9b8a-93a6-4e6d-8cbe-d13b1c6d398b';
const BODY = {
  sessionId: SESSION_ID,
  title: 'Discord design conversation',
  platform: 'desktop-audio',
};
const query = vi.fn();
const mutation = vi.fn();
const client = { query, mutation } as unknown as CoreApiClient;

beforeEach(() => {
  vi.resetAllMocks();
  query.mockResolvedValue({});
  mutation.mockResolvedValue({});
  agenda.mockResolvedValue({ meetings: [] });
  request.mockResolvedValue({
    ok: true,
    data: {
      id: 'upload-1',
      upload_token: 'ephemeral-token',
      metadata: {
        twentyWorkspaceId: 'workspace-1',
        twentyCallRecordingId: SESSION_ID,
        twentyUserWorkspaceId: 'user-1',
      },
    },
  });
});

describe('desktop upload provisioning', () => {
  it('reserves the shared CallRecording before creating an audio-only upload and returns no server secret', async () => {
    const result = await createDesktopRecordingUpload(client, 'user-1', BODY);
    expect(result).toEqual({
      callRecordingId: SESSION_ID,
      uploadToken: 'ephemeral-token',
      apiUrl: 'https://eu-central-1.recall.ai',
    });
    expect(
      mutation.mock.calls[0][0].createCallRecording.__args.data,
    ).toMatchObject({
      id: SESSION_ID,
      status: 'JOINING',
      companionSession: {
        userWorkspaceId: 'user-1',
        source: 'desktop',
        media: 'audio',
      },
    });
    expect(mutation.mock.invocationCallOrder[0]).toBeLessThan(
      request.mock.invocationCallOrder[0],
    );
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/sdk_upload/',
      maxAttempts: 1,
      body: {
        metadata: {
          twentyWorkspaceId: 'workspace-1',
          twentyCallRecordingId: SESSION_ID,
        },
        recording_config: { audio_mixed_mp3: {}, video_mixed_mp4: null },
      },
    });
  });
  it('routes transcript completion using the recording metadata provisioned with the upload', async () => {
    await createDesktopRecordingUpload(client, 'user-1', BODY);
    const { recording_config } = request.mock.calls[0][0].body;
    const body = {
      event: 'transcript.done',
      data: {
        recording: { id: 'recording-1', metadata: recording_config.metadata },
        transcript: { id: 'transcript-1', metadata: {} },
      },
    };

    expect(extractTwentyWorkspaceIdFromRecallWebhook(body)).toBe('workspace-1');
    expect(recording_config.metadata.twentyCallRecordingId).toBe(SESSION_ID);
  });
  it('resumes an owned pending upload without creating another', async () => {
    query.mockResolvedValue({
      callRecordings: {
        edges: [
          {
            node: {
              id: SESSION_ID,
              status: 'JOINING',
              companionSession: {
                source: 'desktop',
                media: 'audio',
                userWorkspaceId: 'user-1',
                sdkUploadId: 'upload-1',
              },
            },
          },
        ],
      },
    });
    await createDesktopRecordingUpload(client, 'user-1', BODY);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/sdk_upload/upload-1/' }),
    );
    expect(mutation).not.toHaveBeenCalled();
  });
  it('never reveals or cancels another user’s session', async () => {
    query.mockResolvedValue({
      callRecordings: {
        edges: [
          {
            node: {
              id: SESSION_ID,
              status: 'JOINING',
              companionSession: {
                source: 'desktop',
                media: 'audio',
                userWorkspaceId: 'someone-else',
                sdkUploadId: 'upload-1',
              },
            },
          },
        ],
      },
    });
    await expect(
      createDesktopRecordingUpload(client, 'user-1', BODY),
    ).rejects.toThrow('another user');
    await expect(
      failDesktopRecordingCapture(client, 'user-1', BODY),
    ).rejects.toThrow('unavailable');
    expect(request).not.toHaveBeenCalled();
    expect(mutation).not.toHaveBeenCalled();
  });
  it('blocks duplicate calendar capture even when the desktop omits a calendar event ID', async () => {
    agenda.mockResolvedValue({
      meetings: [
        {
          id: 'event-1',
          startsAt: new Date(Date.now() - 1000).toISOString(),
          endsAt: new Date(Date.now() + 60_000).toISOString(),
          recordingEnabled: true,
          usesCalendarBot: true,
          url: 'https://meet.google.com/design-sync',
        },
      ],
    });
    await expect(
      createDesktopRecordingUpload(client, 'user-1', {
        ...BODY,
        meetingUrl: 'https://meet.google.com/design-sync?authuser=1',
      }),
    ).rejects.toThrow('duplicate');
    expect(request).not.toHaveBeenCalled();
  });
  it('allows an unscheduled audio call while an unrelated calendar bot is scheduled', async () => {
    agenda.mockResolvedValue({
      meetings: [
        {
          id: 'event-1',
          startsAt: new Date(Date.now() - 1000).toISOString(),
          endsAt: new Date(Date.now() + 60_000).toISOString(),
          recordingEnabled: true,
          usesCalendarBot: true,
          url: 'https://meet.google.com/design-sync',
        },
      ],
    });
    await expect(
      createDesktopRecordingUpload(client, 'user-1', BODY),
    ).resolves.toMatchObject({ callRecordingId: SESSION_ID });
    expect(
      mutation.mock.calls[0][0].createCallRecording.__args.data,
    ).not.toHaveProperty('calendarEventId');
    expect(request).toHaveBeenCalledOnce();
  });
  it('marks failed setup without retrying an ambiguous provider create', async () => {
    request.mockResolvedValue({
      ok: false,
      status: null,
      errorMessage: 'timeout',
    });
    await expect(
      createDesktopRecordingUpload(client, 'user-1', BODY),
    ).rejects.toThrow('prepare');
    expect(request).toHaveBeenCalledTimes(1);
    expect(
      mutation.mock.calls[1][0].updateCallRecording.__args.data.status,
    ).toBe('FAILED');
  });
});
