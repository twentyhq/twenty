import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_ASSISTANT_INITIAL_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-status-steps';
import { buildTeamsAssistantPlaceholderKvKey } from 'src/features/chat/logic-functions/utils/build-teams-assistant-placeholder-kv-key';
import { startTeamsAssistantPlaceholder } from 'src/features/chat/logic-functions/utils/start-teams-assistant-placeholder';

const {
  sendActivityMock,
  updateActivityMock,
  deleteActivityMock,
  kvGetMock,
  kvSetMock,
  kvDeleteMock,
} = vi.hoisted(() => ({
  sendActivityMock: vi.fn(),
  updateActivityMock: vi.fn(),
  deleteActivityMock: vi.fn(),
  kvGetMock: vi.fn(),
  kvSetMock: vi.fn(),
  kvDeleteMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, set: kvSetMock, delete: kvDeleteMock },
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
  'src/features/chat/logic-functions/utils/update-teams-activity',
  () => ({ updateTeamsActivity: updateActivityMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/delete-teams-activity',
  () => ({ deleteTeamsActivity: deleteActivityMock }),
);

const CONVERSATION = {
  serviceUrl: 'https://smba.trafficmanager.net/amer/',
  conversationId: '19:channel@thread.tacv2;messageid=1700000000000',
};

const REQUEST_ID = 'request-1';
const PLACEHOLDER_KV_KEY = buildTeamsAssistantPlaceholderKvKey({
  requestId: REQUEST_ID,
});

const PLACEHOLDER = {
  ...CONVERSATION,
  activityId: 'placeholder-1',
  accessToken: 'token',
};

const message = (text: string) => ({
  type: 'message',
  textFormat: 'extendedmarkdown',
  text,
});

const ANSWER = 'Acme has 3 open deals.';
const FAILURE = 'Something went wrong.';

const sentMessage = (text: string) => ({
  ...CONVERSATION,
  accessToken: 'token',
  activity: message(text),
});

describe('startTeamsAssistantPlaceholder', () => {
  const startPlaceholder = () =>
    startTeamsAssistantPlaceholder({ ...CONVERSATION, requestId: REQUEST_ID });

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    sendActivityMock.mockResolvedValue({ id: 'placeholder-1' });
    updateActivityMock.mockResolvedValue({ id: 'placeholder-1' });
    deleteActivityMock.mockResolvedValue(undefined);
    kvGetMock.mockResolvedValue(undefined);
    kvSetMock.mockResolvedValue(undefined);
    kvDeleteMock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('should post a placeholder in the thread and replace it with the answer', async () => {
    const status = await startPlaceholder();

    expect(kvSetMock).toHaveBeenCalledExactlyOnceWith(
      PLACEHOLDER_KV_KEY,
      PLACEHOLDER.activityId,
    );
    expect(kvDeleteMock).not.toHaveBeenCalled();

    await status.finish(ANSWER);

    expect(sendActivityMock).toHaveBeenCalledExactlyOnceWith(
      sentMessage(TEAMS_ASSISTANT_INITIAL_STATUS),
    );
    expect(kvDeleteMock).toHaveBeenCalledExactlyOnceWith(PLACEHOLDER_KV_KEY);
    expect(updateActivityMock).toHaveBeenCalledExactlyOnceWith({
      ...PLACEHOLDER,
      activity: message(ANSWER),
    });
    expect(deleteActivityMock).not.toHaveBeenCalled();
  });

  it('should only send the answer when the placeholder cannot be posted', async () => {
    sendActivityMock.mockRejectedValueOnce(new Error('429'));

    const status = await startPlaceholder();

    await status.finish(ANSWER);

    expect(sendActivityMock).toHaveBeenLastCalledWith(sentMessage(ANSWER));
    expect(sendActivityMock).toHaveBeenCalledTimes(2);
    expect(updateActivityMock).not.toHaveBeenCalled();
    expect(deleteActivityMock).not.toHaveBeenCalled();
  });

  it('should send the answer as a new message and delete the placeholder when the update fails', async () => {
    updateActivityMock.mockRejectedValue(new Error('404'));

    const status = await startPlaceholder();

    await status.finish(ANSWER);

    expect(sendActivityMock).toHaveBeenLastCalledWith(sentMessage(ANSWER));
    expect(deleteActivityMock).toHaveBeenCalledExactlyOnceWith(PLACEHOLDER);
    expect(kvDeleteMock).toHaveBeenCalledExactlyOnceWith(PLACEHOLDER_KV_KEY);
  });

  it('should still deliver the answer when the placeholder cannot be deleted', async () => {
    updateActivityMock.mockRejectedValue(new Error('404'));
    deleteActivityMock.mockRejectedValue(new Error('403'));

    const status = await startPlaceholder();

    await expect(status.finish(ANSWER)).resolves.toBeUndefined();
    expect(sendActivityMock).toHaveBeenLastCalledWith(sentMessage(ANSWER));
  });

  it('should keep the placeholder for the failure text when the answer cannot be delivered', async () => {
    const status = await startPlaceholder();

    updateActivityMock.mockRejectedValueOnce(new Error('413'));
    sendActivityMock.mockRejectedValueOnce(new Error('413'));

    await expect(status.finish(ANSWER)).rejects.toThrow('413');
    expect(deleteActivityMock).not.toHaveBeenCalled();
    expect(kvDeleteMock).not.toHaveBeenCalled();

    await status.finish(FAILURE);

    expect(updateActivityMock).toHaveBeenLastCalledWith({
      ...PLACEHOLDER,
      activity: message(FAILURE),
    });
    expect(sendActivityMock).toHaveBeenCalledTimes(2);
    expect(deleteActivityMock).not.toHaveBeenCalled();
  });

  it('should reuse the placeholder a previous run of the request posted', async () => {
    kvGetMock.mockResolvedValue(PLACEHOLDER.activityId);

    const status = await startPlaceholder();

    await status.finish(ANSWER);

    expect(kvGetMock).toHaveBeenCalledExactlyOnceWith(PLACEHOLDER_KV_KEY);
    expect(sendActivityMock).not.toHaveBeenCalled();
    expect(updateActivityMock).toHaveBeenCalledExactlyOnceWith({
      ...PLACEHOLDER,
      activity: message(ANSWER),
    });
  });

  it('should still replace the placeholder when its id cannot be stored', async () => {
    kvGetMock.mockRejectedValue(new Error('kv down'));
    kvSetMock.mockRejectedValue(new Error('kv down'));
    kvDeleteMock.mockRejectedValue(new Error('kv down'));

    const status = await startPlaceholder();

    await expect(status.finish(ANSWER)).resolves.toBeUndefined();
    expect(updateActivityMock).toHaveBeenCalledExactlyOnceWith({
      ...PLACEHOLDER,
      activity: message(ANSWER),
    });
  });
});
