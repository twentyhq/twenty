import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { SidePanelSearchAiAnswerCard } from '@/side-panel/pages/search/components/SidePanelSearchAiAnswerCard';
import { type SidePanelSearchAiAnswerState } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswerState';

const openAskAiPageWithPreprompt = jest.fn();
const openSidePanelSearchRecord = jest.fn();
const sendSidePanelSearchAskAiHandoff = jest.fn();
const requestQuickAnswer = jest.fn();

jest.mock('@/ai-chat/composer/hooks/useOpenAskAiPageWithPreprompt', () => ({
  useOpenAskAiPageWithPreprompt: () => ({ openAskAiPageWithPreprompt }),
}));

jest.mock(
  '@/side-panel/pages/search/hooks/useOpenSidePanelSearchRecord',
  () => ({
    useOpenSidePanelSearchRecord: () => ({ openSidePanelSearchRecord }),
  }),
);

jest.mock(
  '@/side-panel/pages/search/utils/sendSidePanelSearchAskAiHandoff',
  () => ({
    sendSidePanelSearchAskAiHandoff: (
      ...args: Parameters<typeof sendSidePanelSearchAskAiHandoff>
    ) => sendSidePanelSearchAskAiHandoff(...args),
  }),
);

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock('twenty-ui/icon/provider', () => ({
  useIcons: () => ({ getIcon: () => undefined }),
}));

const QUESTION = 'Where is Acme based?';
const SEARCH_SESSION_ID = 'search-session-id';

const renderCard = (
  answerState: Exclude<SidePanelSearchAiAnswerState, { status: 'idle' }>,
) =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <SidePanelSearchAiAnswerCard
          question={QUESTION}
          answerState={answerState}
          searchSessionId={SEARCH_SESSION_ID}
          onRequestQuickAnswer={requestQuickAnswer}
        />
      </MemoryRouter>
    </I18nProvider>,
  );

describe('SidePanelSearchAiAnswerCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a grounded answer whose source opens the record', async () => {
    const user = userEvent.setup();

    renderCard({
      status: 'loaded',
      answer: {
        kind: 'answer',
        text: 'Acme is based in Paris.',
        sources: [
          {
            objectNameSingular: 'company',
            recordId: 'acme-id',
            displayName: 'Acme',
          },
        ],
      },
    });

    expect(screen.getByText('Acme is based in Paris.')).toBeVisible();

    const sourceLink = screen.getByRole('link', { name: 'Acme' });

    expect(sourceLink).toHaveAttribute('href', '/object/company/acme-id');

    await user.click(sourceLink);

    expect(openSidePanelSearchRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: 'company',
        recordId: 'acme-id',
      }),
    );
  });

  it('prefills the exact question in a new chat without sending it', async () => {
    const user = userEvent.setup();

    const answerState = {
      status: 'loaded',
      answer: { kind: 'handoff' },
    } as const;

    renderCard(answerState);

    expect(
      screen.getByText('Ask AI can explore more records to answer this.'),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Ask in a new chat' }));

    expect(openAskAiPageWithPreprompt).toHaveBeenCalledWith({
      serializedDocument:
        serializePlainTextAsAdvancedTextEditorDocument(QUESTION),
      mode: 'PREFILL',
    });
    expect(sendSidePanelSearchAskAiHandoff).toHaveBeenCalledWith({
      searchSessionId: SEARCH_SESSION_ID,
      answerState,
    });
  });

  it('offers a quick answer next to the chat handoff for plain searches', async () => {
    const user = userEvent.setup();

    renderCard({ status: 'quickAnswerAvailable', reason: 'notAQuestion' });

    await user.click(
      screen.getByRole('button', { name: 'Get a quick answer' }),
    );

    expect(requestQuickAnswer).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', { name: 'Ask in a new chat' }),
    ).toBeVisible();
    expect(
      screen.queryByText('Automatic answers are paused for now.'),
    ).not.toBeInTheDocument();
  });

  it('explains why the answer was not generated automatically once the allowance is used up', () => {
    renderCard({
      status: 'quickAnswerAvailable',
      reason: 'automaticLimitReached',
    });

    expect(
      screen.getByText('Automatic answers are paused for now.'),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Get a quick answer' }),
    ).toBeVisible();
  });

  it('keeps the chat handoff while loading and after a failure', () => {
    const { unmount } = renderCard({ status: 'loading' });

    expect(
      screen.getByRole('status', { name: 'Generating an answer' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ask in a new chat' }),
    ).toBeVisible();

    unmount();
    renderCard({ status: 'failed' });

    expect(
      screen.getByText('AI answers are not available right now.'),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Ask in a new chat' }),
    ).toBeVisible();
  });
});
