import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';

import { AiChatRecordApprovalDeck } from '@/ai/components/AiChatRecordApprovalDeck';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { type AgentChatPendingRecordApproval } from '@/ai/types/AgentChatPendingRecordApproval';

const answerAgentChatToolCall = jest.fn();
jest.mock('@/ai/hooks/useAnswerAgentChatToolCall', () => ({
  useAnswerAgentChatToolCall: () => ({ answerAgentChatToolCall }),
}));

// the table needs workspace metadata, so a stub stands in for it
jest.mock('@/ai/components/AiChatRecordApprovalReview', () => ({
  AiChatRecordApprovalReview: ({
    onSelectedToolCallIdsChange,
  }: {
    onSelectedToolCallIdsChange: (toolCallIds: string[]) => void;
  }) => (
    <button onClick={() => onSelectedToolCallIdsChange(['Ada', 'Joan'])}>
      Skip Grace
    </button>
  ),
}));

const buildRecordCreation = (
  firstName: string,
): AgentChatPendingRecordApproval => ({
  toolCallId: firstName,
  proposal: {
    toolName: 'create_person',
    toolLabel: 'Create person',
    summary: firstName,
    arguments: { city: firstName },
    template: 'recordCreate',
    objectNameSingular: 'person',
  },
});

const RECORD_CREATIONS = ['Ada', 'Grace', 'Joan'].map(buildRecordCreation);

const Deck = () => {
  const [answeringToolCallIds, setAnsweringToolCallIds] = useState<string[]>(
    [],
  );

  return (
    <AiChatRecordApprovalDeck
      recordApprovals={RECORD_CREATIONS}
      answeringToolCallIds={answeringToolCallIds}
      onAnsweringToolCallIdsChange={setAnsweringToolCallIds}
    />
  );
};

const renderDeck = (store = createStore()) =>
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={store}>
        <Deck />
      </Provider>
    </I18nProvider>,
  );

const getAnswers = () =>
  answerAgentChatToolCall.mock.calls.map(([{ toolCallId, response }]) => [
    toolCallId,
    response.decision,
  ]);

describe('AiChatRecordApprovalDeck', () => {
  beforeEach(() => {
    answerAgentChatToolCall.mockReset().mockResolvedValue(true);
  });

  it('approves the selected records and rejects the skipped ones', async () => {
    const user = userEvent.setup();

    renderDeck();

    await user.click(screen.getByRole('button', { name: 'Skip Grace' }));
    await user.click(screen.getByRole('button', { name: 'Create 2' }));

    await waitFor(() =>
      expect(getAnswers()).toEqual([
        ['Ada', 'approve'],
        ['Grace', 'reject'],
        ['Joan', 'approve'],
      ]),
    );
  });

  it('rejects every record when the person denies', async () => {
    const user = userEvent.setup();

    renderDeck();

    await user.click(screen.getByRole('button', { name: 'Deny' }));

    await waitFor(() =>
      expect(getAnswers()).toEqual([
        ['Ada', 'reject'],
        ['Grace', 'reject'],
        ['Joan', 'reject'],
      ]),
    );
  });

  it('lets the person answer again when an answer fails', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockResolvedValue(false);

    renderDeck();

    await user.click(screen.getByRole('button', { name: 'Create 3' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create 3' })).toBeEnabled(),
    );
    expect(answerAgentChatToolCall).toHaveBeenCalledTimes(1);
  });

  it('keeps answering in its conversation when the person opens another one', async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(agentChatDisplayedThreadState.atom, 'thread-1');
    answerAgentChatToolCall.mockImplementation(async () => {
      store.set(agentChatDisplayedThreadState.atom, 'thread-2');

      return true;
    });

    renderDeck(store);

    await user.click(screen.getByRole('button', { name: 'Create 3' }));

    await waitFor(() =>
      expect(answerAgentChatToolCall).toHaveBeenCalledTimes(3),
    );
    expect(
      answerAgentChatToolCall.mock.calls.map(([{ threadId }]) => threadId),
    ).toEqual(['thread-1', 'thread-1', 'thread-1']);
  });
});
