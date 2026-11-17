import type * as LogicFunctionModule from 'twenty-sdk/logic-function';
import { kv, Response } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GOOGLE_MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { googleMeetEventsResolverHandler } from 'src/logic-functions/google-meet-events-resolver';
import { isGooglePubsubPushAuthorized } from 'src/logic-functions/utils/is-google-pubsub-push-authorized.util';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof LogicFunctionModule>()),
  kv: { get: vi.fn() },
}));

vi.mock(
  'src/logic-functions/utils/is-google-pubsub-push-authorized.util',
  () => ({ isGooglePubsubPushAuthorized: vi.fn() }),
);

const AUDIENCE = 'https://twenty.example.com/google-meet';
const SERVICE_ACCOUNT_EMAIL = 'google-meet-push@twenty.iam.gserviceaccount.com';

const PUSH_REQUEST = {
  headers: { authorization: 'Bearer token' },
  body: {
    message: {
      attributes: {
        'ce-source': '//workspaceevents.googleapis.com/subscriptions/first',
        'ce-type': 'google.workspace.meet.transcript.v2.fileGenerated',
      },
      data: Buffer.from(
        JSON.stringify({
          transcript: { name: 'conferenceRecords/first/transcripts/first' },
        }),
      ).toString('base64'),
    },
  },
};

describe('googleMeetEventsResolverHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GOOGLE_MEET_PUBSUB_AUDIENCE', AUDIENCE);
    vi.stubEnv(
      'GOOGLE_MEET_PUBSUB_SERVICE_ACCOUNT_EMAIL',
      SERVICE_ACCOUNT_EMAIL,
    );
    vi.mocked(isGooglePubsubPushAuthorized).mockResolvedValue(true);
    vi.mocked(kv.get).mockResolvedValue('workspace-id');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should route an event to the workspace that claims its subscription', async () => {
    await expect(
      googleMeetEventsResolverHandler(PUSH_REQUEST),
    ).resolves.toEqual({
      workspaceId: 'workspace-id',
      targetLogicFunctionUniversalIdentifier:
        GOOGLE_MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER,
      payload: {
        subscriptionName: 'subscriptions/first',
        eventType: 'google.workspace.meet.transcript.v2.fileGenerated',
        artifactName: 'conferenceRecords/first/transcripts/first',
      },
    });

    expect(isGooglePubsubPushAuthorized).toHaveBeenCalledExactlyOnceWith({
      authorizationHeader: 'Bearer token',
      audience: AUDIENCE,
      serviceAccountEmail: SERVICE_ACCOUNT_EMAIL,
    });
    expect(kv.get).toHaveBeenCalledExactlyOnceWith(
      'google-meet-event-subscription:subscriptions/first',
      { scope: 'SERVER' },
    );
  });

  it('should refuse a request that Pub/Sub did not sign', async () => {
    vi.mocked(isGooglePubsubPushAuthorized).mockResolvedValue(false);

    await expect(
      googleMeetEventsResolverHandler(PUSH_REQUEST),
    ).resolves.toEqual(
      new Response({ error: 'Unauthorized' }, { status: 401 }),
    );

    expect(kv.get).not.toHaveBeenCalled();
  });

  it('should refuse every request until the push settings are configured', async () => {
    vi.stubEnv('GOOGLE_MEET_PUBSUB_SERVICE_ACCOUNT_EMAIL', '');

    await expect(
      googleMeetEventsResolverHandler(PUSH_REQUEST),
    ).resolves.toEqual(
      new Response(
        { error: 'Google Meet events are not configured' },
        { status: 503 },
      ),
    );

    expect(isGooglePubsubPushAuthorized).not.toHaveBeenCalled();
  });

  it('should fail for an event whose data cannot be read', async () => {
    await expect(
      googleMeetEventsResolverHandler({
        ...PUSH_REQUEST,
        body: {
          message: {
            ...PUSH_REQUEST.body.message,
            data: Buffer.from('not json').toString('base64'),
          },
        },
      }),
    ).rejects.toMatchObject({ code: 'EVENT_DATA_UNREADABLE' });

    expect(kv.get).not.toHaveBeenCalled();
  });

  it('should acknowledge a message that is not a Google Meet event', async () => {
    await expect(
      googleMeetEventsResolverHandler({ ...PUSH_REQUEST, body: {} }),
    ).resolves.toEqual(
      new Response({ ok: true, skipped: 'Not a Google Meet event' }),
    );

    expect(kv.get).not.toHaveBeenCalled();
  });

  it('should acknowledge an event whose subscription no workspace claims', async () => {
    vi.mocked(kv.get).mockResolvedValue(null);

    await expect(
      googleMeetEventsResolverHandler(PUSH_REQUEST),
    ).resolves.toEqual(
      new Response({
        ok: true,
        skipped: 'No workspace claims this subscription',
      }),
    );

    expect(kv.get).toHaveBeenCalledExactlyOnceWith(
      'google-meet-event-subscription:subscriptions/first',
      { scope: 'SERVER' },
    );
  });
});
