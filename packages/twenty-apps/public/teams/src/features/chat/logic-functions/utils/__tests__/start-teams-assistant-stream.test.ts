import { beforeEach, describe, expect, it, vi } from 'vitest';

import { startTeamsAssistantStream } from 'src/features/chat/logic-functions/utils/start-teams-assistant-stream';

const { sendActivityMock, requestConnectorMock } = vi.hoisted(() => ({
  sendActivityMock: vi.fn(),
  requestConnectorMock: vi.fn(),
}));

vi.mock(
  'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw',
  () => ({
    getTeamsConnectorAccessTokenOrThrow: vi.fn().mockResolvedValue('token'),
  }),
);

vi.mock('src/features/chat/logic-functions/utils/send-teams-activity', () => ({
  sendTeamsActivity: sendActivityMock,
}));

vi.mock(
  'src/features/chat/logic-functions/utils/request-teams-connector',
  () => ({ requestTeamsConnector: requestConnectorMock }),
);

const CONVERSATION = {
  serviceUrl: 'https://smba.trafficmanager.net/amer/',
  conversationId: 'a:personal-conversation',
};

const streamedActivities = () =>
  requestConnectorMock.mock.calls.map(([{ body }]) => body);

describe('startTeamsAssistantStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendActivityMock.mockResolvedValue({ id: 'stream-1' });
    requestConnectorMock.mockResolvedValue('{}');
  });

  it('should open an informative stream and number every update in order', async () => {
    const writer = await startTeamsAssistantStream({
      ...CONVERSATION,
      text: 'Thinking…',
    });

    expect(sendActivityMock).toHaveBeenCalledExactlyOnceWith({
      ...CONVERSATION,
      accessToken: 'token',
      activity: {
        type: 'typing',
        text: 'Thinking…',
        entities: [
          { type: 'streaminfo', streamType: 'informative', streamSequence: 1 },
        ],
      },
    });

    await writer.update('Digging through your CRM…');
    await writer.update('Still on it…');
    await writer.finish('Acme has 3 open deals.');

    expect(requestConnectorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceUrl: CONVERSATION.serviceUrl,
        path: '/v3/conversations/a%3Apersonal-conversation/activities',
        method: 'POST',
        accessToken: 'token',
      }),
    );
    expect(streamedActivities()).toEqual([
      {
        type: 'typing',
        text: 'Digging through your CRM…',
        entities: [
          {
            type: 'streaminfo',
            streamId: 'stream-1',
            streamType: 'informative',
            streamSequence: 2,
          },
        ],
      },
      {
        type: 'typing',
        text: 'Still on it…',
        entities: [
          {
            type: 'streaminfo',
            streamId: 'stream-1',
            streamType: 'informative',
            streamSequence: 3,
          },
        ],
      },
      {
        type: 'message',
        text: 'Acme has 3 open deals.',
        entities: [
          { type: 'streaminfo', streamId: 'stream-1', streamType: 'final' },
        ],
      },
    ]);
  });

  it('should not open a stream when Teams rejects the first update', async () => {
    sendActivityMock.mockRejectedValue(
      new Error('403 ContentStreamNotAllowed'),
    );

    await expect(
      startTeamsAssistantStream({ ...CONVERSATION, text: 'Thinking…' }),
    ).rejects.toThrow('ContentStreamNotAllowed');
    expect(requestConnectorMock).not.toHaveBeenCalled();
  });
});
