import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildTeamsAssistantPlaceholderKvKey } from 'src/features/chat/logic-functions/utils/build-teams-assistant-placeholder-kv-key';
import { replaceTeamsAssistantPlaceholder } from 'src/features/chat/logic-functions/utils/replace-teams-assistant-placeholder';

const { kvGetMock, updateActivityMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  updateActivityMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({ kv: { get: kvGetMock } }));

vi.mock(
  'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw',
  () => ({
    getTeamsConnectorAccessTokenOrThrow: vi.fn().mockResolvedValue('token'),
  }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/update-teams-activity',
  () => ({ updateTeamsActivity: updateActivityMock }),
);

const REPLACEMENT = {
  serviceUrl: 'https://smba.trafficmanager.net/amer/',
  conversationId: '19:channel@thread.tacv2;messageid=1700000000000',
  requestId: 'request-1',
  text: 'Something went wrong.',
};

describe('replaceTeamsAssistantPlaceholder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    kvGetMock.mockResolvedValue('placeholder-1');
    updateActivityMock.mockResolvedValue({ id: 'placeholder-1' });
  });

  it('should replace the placeholder stored for the request', async () => {
    await expect(replaceTeamsAssistantPlaceholder(REPLACEMENT)).resolves.toBe(
      true,
    );

    expect(kvGetMock).toHaveBeenCalledExactlyOnceWith(
      buildTeamsAssistantPlaceholderKvKey({ requestId: 'request-1' }),
    );
    expect(updateActivityMock).toHaveBeenCalledExactlyOnceWith({
      serviceUrl: REPLACEMENT.serviceUrl,
      conversationId: REPLACEMENT.conversationId,
      activityId: 'placeholder-1',
      accessToken: 'token',
      activity: {
        type: 'message',
        textFormat: 'extendedmarkdown',
        text: REPLACEMENT.text,
      },
    });
  });

  it('should report nothing replaced when the request has no placeholder', async () => {
    kvGetMock.mockResolvedValue(undefined);

    await expect(replaceTeamsAssistantPlaceholder(REPLACEMENT)).resolves.toBe(
      false,
    );
    expect(updateActivityMock).not.toHaveBeenCalled();
  });

  it('should report nothing replaced when the placeholder id cannot be read', async () => {
    kvGetMock.mockRejectedValue(new Error('kv down'));

    await expect(replaceTeamsAssistantPlaceholder(REPLACEMENT)).resolves.toBe(
      false,
    );
  });

  it('should report nothing replaced when the update fails', async () => {
    updateActivityMock.mockRejectedValue(new Error('404'));

    await expect(replaceTeamsAssistantPlaceholder(REPLACEMENT)).resolves.toBe(
      false,
    );
  });
});
