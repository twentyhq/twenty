import { Response } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_ACTIVITIES_ENQUEUE_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { teamsActivitiesResolverHandler } from 'src/features/chat/logic-functions/teams-activities-resolver';
import { TeamsActivityTokenInvalidError } from 'src/features/chat/logic-functions/types/teams-activity-token-invalid-error';
import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';

const { kvGetMock, verifyTokenMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  verifyTokenMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  kv: { get: kvGetMock },
}));

vi.mock(
  'src/features/chat/logic-functions/utils/verify-teams-activity-token',
  () => ({ verifyTeamsActivityTokenOrThrow: verifyTokenMock }),
);

const SERVICE_URL = 'https://smba.trafficmanager.net/emea/';

const MESSAGE_ACTIVITY: TeamsInboundActivity = {
  type: 'message',
  id: 'activity-1',
  text: 'hello',
  serviceUrl: SERVICE_URL,
  conversation: { id: 'conversation-1', conversationType: 'personal' },
  channelData: { tenant: { id: 'tenant-1' } },
};

const resolve = (activity: TeamsInboundActivity | null) =>
  teamsActivitiesResolverHandler({
    headers: { authorization: 'Bearer bot-framework-token' },
    body: activity,
  });

describe('teamsActivitiesResolverHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('TEAMS_BOT_APP_ID', 'bot-app-id');
    vi.stubEnv('TEAMS_BOT_APP_PASSWORD', 'bot-app-password');
    vi.stubEnv('TEAMS_BOT_TENANT_ID', 'bot-tenant-id');
    verifyTokenMock.mockResolvedValue(SERVICE_URL);
    kvGetMock.mockResolvedValue('workspace-1');
  });

  it('routes a verified message to the workspace that claimed its tenant', async () => {
    const result = await resolve(MESSAGE_ACTIVITY);

    expect(result).toEqual({
      workspaceId: 'workspace-1',
      targetLogicFunctionUniversalIdentifier:
        TEAMS_ACTIVITIES_ENQUEUE_UNIVERSAL_IDENTIFIER,
      payload: {
        activity: MESSAGE_ACTIVITY,
        serviceUrl: SERVICE_URL,
        tenantId: 'tenant-1',
      },
    });
    expect(verifyTokenMock.mock.calls).toEqual([
      [
        {
          authorizationHeader: 'Bearer bot-framework-token',
          activityServiceUrl: SERVICE_URL,
          botAppId: 'bot-app-id',
        },
      ],
    ]);
    expect(kvGetMock.mock.calls).toEqual([
      ['teams-tenant:tenant-1', { scope: 'SERVER' }],
    ]);
  });

  it('rejects an activity whose token does not verify', async () => {
    verifyTokenMock.mockRejectedValue(
      new TeamsActivityTokenInvalidError('signature verification failed'),
    );

    const result = await resolve(MESSAGE_ACTIVITY);

    expect(result).toEqual(
      new Response({ error: 'Unauthorized' }, { status: 401 }),
    );
    expect(kvGetMock).not.toHaveBeenCalled();
  });

  it('fails with a server error when the signing keys cannot be loaded', async () => {
    verifyTokenMock.mockRejectedValue(new Error('Key endpoint unavailable'));

    await expect(resolve(MESSAGE_ACTIVITY)).rejects.toThrow(
      'Key endpoint unavailable',
    );
    expect(kvGetMock).not.toHaveBeenCalled();
  });

  it('refuses activities while the bot credentials are not configured', async () => {
    vi.stubEnv('TEAMS_BOT_APP_ID', '');

    const result = await resolve(MESSAGE_ACTIVITY);

    expect(result).toBeInstanceOf(Response);
    expect(result).toMatchObject({ status: 503 });
    expect(verifyTokenMock).not.toHaveBeenCalled();
  });

  it.each([
    [
      'a body without a serviceUrl',
      null,
      new Response({ error: 'Missing Teams activity' }, { status: 400 }),
    ],
    [
      'a non-message activity',
      { ...MESSAGE_ACTIVITY, type: 'conversationUpdate' },
      new Response({ ok: true, skipped: 'Not a message' }),
    ],
    [
      'an activity without a tenant',
      { ...MESSAGE_ACTIVITY, channelData: undefined },
      new Response({ ok: true, skipped: 'No tenant on the activity' }),
    ],
  ])('does not dispatch %s', async (_, activity, expectedResponse) => {
    expect(await resolve(activity)).toEqual(expectedResponse);
    expect(kvGetMock).not.toHaveBeenCalled();
  });

  it('reads the tenant from the conversation when channelData has none', async () => {
    const result = await resolve({
      ...MESSAGE_ACTIVITY,
      channelData: undefined,
      conversation: { id: 'conversation-1', tenantId: 'tenant-2' },
    });

    expect(result).toMatchObject({ payload: { tenantId: 'tenant-2' } });
    expect(kvGetMock.mock.calls).toEqual([
      ['teams-tenant:tenant-2', { scope: 'SERVER' }],
    ]);
  });

  it('does not dispatch when no workspace claims the tenant', async () => {
    kvGetMock.mockResolvedValue(null);

    const result = await resolve(MESSAGE_ACTIVITY);

    expect(result).toEqual(
      new Response({
        ok: true,
        skipped: 'No workspace claims this Teams tenant',
      }),
    );
  });
});
