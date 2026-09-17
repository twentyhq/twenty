import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { WorkflowRunStepConversation } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowRunStepConversation';
import { type AgentChatThread } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const navigateToAiChatPage = jest.fn();

jest.mock('@/ai/hooks/useNavigateToAiChatPage', () => ({
  useNavigateToAiChatPage: () => ({ navigateToAiChatPage }),
}));

const RUN_ID = 'run-id';
const STEP_ID = 'step-id';

const RUN_THREAD: AgentChatThread = {
  __typename: 'AgentChatThread',
  id: 'thread-id',
  title: '#2 - Lead qualification · Qualify the lead',
  channelId: null,
  workflowRunId: RUN_ID,
  workflowStepId: STEP_ID,
  ownerUserWorkspaceId: 'uw-tim',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCacheReadTokens: 0,
  conversationSize: 0,
  totalInputCredits: 0,
  totalOutputCredits: 0,
};

const renderWithThreads = (
  threads: AgentChatThread[],
  stepExecutionStatus: 'PENDING' | 'SUCCESS',
) => {
  const store = createStore();

  store.set(metadataStoreState.atomFamily('agentChatThreads'), {
    current: threads,
    draft: threads,
    status: 'up-to-date',
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    </JotaiProvider>
  );

  return render(
    <WorkflowRunStepConversation
      workflowRunId={RUN_ID}
      stepId={STEP_ID}
      stepExecutionStatus={stepExecutionStatus}
    />,
    { wrapper: Wrapper },
  );
};

describe('WorkflowRunStepConversation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens the conversation of a finished step', async () => {
    const user = userEvent.setup();
    renderWithThreads([RUN_THREAD], 'SUCCESS');

    await user.click(screen.getByRole('button', { name: 'Open conversation' }));
    expect(navigateToAiChatPage).toHaveBeenCalledWith({ threadId: 'thread-id' });
  });

  it('tells the reader the run waits on an answer', () => {
    renderWithThreads([RUN_THREAD], 'PENDING');

    expect(
      screen.getByText(
        'The agent asked a question and the run is waiting for the answer.',
      ),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Answer in the conversation' }),
    ).toBeVisible();
  });

  it('shows nothing for a step without a conversation', () => {
    renderWithThreads([{ ...RUN_THREAD, workflowStepId: 'other-step' }], 'SUCCESS');

    expect(screen.queryByRole('button')).toBeNull();
  });
});
