import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  TEAMS_ASSISTANT_INITIAL_STATUS,
  TEAMS_ASSISTANT_STATUS_STEPS,
} from 'src/features/chat/logic-functions/constants/teams-assistant-status-steps';
import { TEAMS_ASSISTANT_STREAM_HANDOFF_STEP } from 'src/features/chat/logic-functions/constants/teams-assistant-stream-handoff-step';
import { startTeamsAssistantStatus } from 'src/features/chat/logic-functions/utils/start-teams-assistant-status';

const { sendActivityMock, startStreamMock, updateMock, finishMock } =
  vi.hoisted(() => ({
    sendActivityMock: vi.fn(),
    startStreamMock: vi.fn(),
    updateMock: vi.fn(),
    finishMock: vi.fn(),
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
  'src/features/chat/logic-functions/utils/start-teams-assistant-stream',
  () => ({ startTeamsAssistantStream: startStreamMock }),
);

const CONVERSATION = {
  serviceUrl: 'https://smba.trafficmanager.net/amer/',
  conversationId: 'a:personal-conversation',
};

const PERSONAL = { ...CONVERSATION, conversationType: 'personal' };

const sentMessageTexts = () =>
  sendActivityMock.mock.calls.map(([{ activity }]) => activity.text);

describe('startTeamsAssistantStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sendActivityMock.mockResolvedValue({ id: 'activity-1' });
    startStreamMock.mockResolvedValue({
      update: updateMock,
      finish: finishMock,
    });
    updateMock.mockResolvedValue(undefined);
    finishMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should stream the status steps in a personal chat and end the stream with the answer', async () => {
    const status = await startTeamsAssistantStatus(PERSONAL);

    expect(startStreamMock).toHaveBeenCalledExactlyOnceWith({
      ...CONVERSATION,
      text: TEAMS_ASSISTANT_INITIAL_STATUS,
    });

    await vi.advanceTimersByTimeAsync(
      TEAMS_ASSISTANT_STATUS_STEPS[1].afterSeconds * 1000,
    );

    expect(updateMock.mock.calls.map(([text]) => text)).toEqual(
      TEAMS_ASSISTANT_STATUS_STEPS.slice(0, 2).map((step) => step.text),
    );

    await status.finish('Acme has 3 open deals.');
    await vi.runAllTimersAsync();

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(finishMock).toHaveBeenCalledExactlyOnceWith(
      'Acme has 3 open deals.',
    );
    expect(sendActivityMock).not.toHaveBeenCalled();
  });

  it('should send a plain message when the stream cannot be opened', async () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    startStreamMock.mockRejectedValue(new Error('403 ContentStreamNotAllowed'));

    const status = await startTeamsAssistantStatus(PERSONAL);

    await status.finish('Acme has 3 open deals.');
    await vi.runAllTimersAsync();

    expect(updateMock).not.toHaveBeenCalled();
    expect(sentMessageTexts()).toEqual(['Acme has 3 open deals.']);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it('should send a plain message when the stream can no longer be finished', async () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    finishMock.mockRejectedValue(new Error('403 exceeded streaming time'));

    const status = await startTeamsAssistantStatus(PERSONAL);

    await status.finish('Acme has 3 open deals.');

    expect(sentMessageTexts()).toEqual(['Acme has 3 open deals.']);

    warnSpy.mockRestore();
  });

  it('should keep going when a status update fails', async () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    updateMock.mockRejectedValueOnce(new Error('429'));

    const status = await startTeamsAssistantStatus(PERSONAL);

    await vi.advanceTimersByTimeAsync(
      TEAMS_ASSISTANT_STATUS_STEPS[1].afterSeconds * 1000,
    );
    await status.finish('Acme has 3 open deals.');

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(finishMock).toHaveBeenCalledExactlyOnceWith(
      'Acme has 3 open deals.',
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it('should not hold the answer behind a status update that never returns', async () => {
    updateMock.mockReturnValueOnce(new Promise<void>(() => undefined));

    const status = await startTeamsAssistantStatus(PERSONAL);

    await vi.advanceTimersByTimeAsync(
      TEAMS_ASSISTANT_STATUS_STEPS[0].afterSeconds * 1000,
    );

    const finished = status.finish('Acme has 3 open deals.');

    await vi.advanceTimersByTimeAsync(5000);
    await finished;

    expect(finishMock).toHaveBeenCalledExactlyOnceWith(
      'Acme has 3 open deals.',
    );
  });

  it('should close the stream before the Teams time limit and send a late answer as a plain message', async () => {
    const status = await startTeamsAssistantStatus(PERSONAL);

    await vi.advanceTimersByTimeAsync(
      TEAMS_ASSISTANT_STREAM_HANDOFF_STEP.afterSeconds * 1000,
    );

    expect(updateMock).toHaveBeenCalledTimes(
      TEAMS_ASSISTANT_STATUS_STEPS.length,
    );
    expect(finishMock).toHaveBeenCalledExactlyOnceWith(
      TEAMS_ASSISTANT_STREAM_HANDOFF_STEP.text,
    );

    await status.finish('Acme has 3 open deals.');

    expect(finishMock).toHaveBeenCalledTimes(1);
    expect(sentMessageTexts()).toEqual(['Acme has 3 open deals.']);
  });

  it('should only reply at the end outside personal chats', async () => {
    const status = await startTeamsAssistantStatus({
      ...CONVERSATION,
      conversationType: 'groupChat',
    });

    await vi.runAllTimersAsync();
    await status.finish('Acme has 3 open deals.');

    expect(startStreamMock).not.toHaveBeenCalled();
    expect(sentMessageTexts()).toEqual(['Acme has 3 open deals.']);
  });
});
