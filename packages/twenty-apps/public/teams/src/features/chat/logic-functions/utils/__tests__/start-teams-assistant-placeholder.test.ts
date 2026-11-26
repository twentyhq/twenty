import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_ASSISTANT_INITIAL_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-status-steps';
import { startTeamsAssistantPlaceholder } from 'src/features/chat/logic-functions/utils/start-teams-assistant-placeholder';

const { sendActivityMock, updateActivityMock, deleteActivityMock } = vi.hoisted(
  () => ({
    sendActivityMock: vi.fn(),
    updateActivityMock: vi.fn(),
    deleteActivityMock: vi.fn(),
  }),
);

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

describe('startTeamsAssistantPlaceholder', () => {
  const sendMessageMock = vi.fn();

  const startPlaceholder = () =>
    startTeamsAssistantPlaceholder({
      ...CONVERSATION,
      sendMessage: sendMessageMock,
    });

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    sendActivityMock.mockResolvedValue({ id: 'placeholder-1' });
    updateActivityMock.mockResolvedValue({ id: 'placeholder-1' });
    deleteActivityMock.mockResolvedValue(undefined);
    sendMessageMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('should post a placeholder in the thread and replace it with the answer', async () => {
    const status = await startPlaceholder();

    expect(sendActivityMock).toHaveBeenCalledExactlyOnceWith({
      ...CONVERSATION,
      accessToken: 'token',
      activity: message(TEAMS_ASSISTANT_INITIAL_STATUS),
    });

    await status.finish(ANSWER);

    expect(updateActivityMock).toHaveBeenCalledExactlyOnceWith({
      ...PLACEHOLDER,
      activity: message(ANSWER),
    });
    expect(sendMessageMock).not.toHaveBeenCalled();
    expect(deleteActivityMock).not.toHaveBeenCalled();
  });

  it('should only send the answer when the placeholder cannot be posted', async () => {
    sendActivityMock.mockRejectedValue(new Error('429'));

    const status = await startPlaceholder();

    await status.finish(ANSWER);

    expect(sendMessageMock).toHaveBeenCalledExactlyOnceWith(ANSWER);
    expect(updateActivityMock).not.toHaveBeenCalled();
    expect(deleteActivityMock).not.toHaveBeenCalled();
  });

  it('should send the answer as a new message and delete the placeholder when the update fails', async () => {
    updateActivityMock.mockRejectedValue(new Error('404'));

    const status = await startPlaceholder();

    await status.finish(ANSWER);

    expect(sendMessageMock).toHaveBeenCalledExactlyOnceWith(ANSWER);
    expect(deleteActivityMock).toHaveBeenCalledExactlyOnceWith(PLACEHOLDER);
  });

  it('should still deliver the answer when the placeholder cannot be deleted', async () => {
    updateActivityMock.mockRejectedValue(new Error('404'));
    deleteActivityMock.mockRejectedValue(new Error('403'));

    const status = await startPlaceholder();

    await expect(status.finish(ANSWER)).resolves.toBeUndefined();
    expect(sendMessageMock).toHaveBeenCalledExactlyOnceWith(ANSWER);
  });

  it('should keep the placeholder for the failure text when the answer cannot be delivered', async () => {
    updateActivityMock.mockRejectedValueOnce(new Error('413'));
    sendMessageMock.mockRejectedValueOnce(new Error('413'));

    const status = await startPlaceholder();

    await expect(status.finish(ANSWER)).rejects.toThrow('413');
    expect(deleteActivityMock).not.toHaveBeenCalled();

    await status.finish('Something went wrong.');

    expect(updateActivityMock).toHaveBeenLastCalledWith({
      ...PLACEHOLDER,
      activity: message('Something went wrong.'),
    });
    expect(sendMessageMock).toHaveBeenCalledTimes(1);
  });

  it('should send later texts as new messages once the placeholder is replaced', async () => {
    const status = await startPlaceholder();

    await status.finish(ANSWER);
    await status.finish('Something went wrong.');

    expect(updateActivityMock).toHaveBeenCalledTimes(1);
    expect(sendMessageMock).toHaveBeenCalledExactlyOnceWith(
      'Something went wrong.',
    );
  });
});
