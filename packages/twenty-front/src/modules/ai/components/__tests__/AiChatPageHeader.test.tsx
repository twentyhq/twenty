import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ai/components/AiChatPageThreadHeader', () => ({
  AiChatPageThreadHeader: ({ threadId }: { threadId: string }) => (
    <div>Chat record header {threadId}</div>
  ),
}));
jest.mock('@/ui/layout/page/components/PageCardHeader', () => ({
  PageCardHeader: ({ title }: { title: ReactNode }) => <div>{title}</div>,
}));

const THREAD_ID = '6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60';
const OTHER_THREAD_ID = '0b9e8d7c-6a5f-4e3d-8c2b-1a0f9e8d7c6b';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <MemoryRouter>{children}</MemoryRouter>
    </I18nProvider>
  </JotaiProvider>
);

describe('AiChatPageHeader', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it.each([null, AGENT_CHAT_NEW_THREAD_DRAFT_KEY])(
    'titles the page New chat without a chat record (%s)',
    (threadId) => {
      jotaiStore.set(currentAiChatThreadState.atom, threadId);
      render(<AiChatPageHeader />, { wrapper: Wrapper });

      expect(screen.getByText('New chat')).toBeVisible();
      expect(screen.queryByText(/Chat record header/)).toBeNull();
    },
  );

  it('shows the record header of the current chat and follows chat switches', () => {
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_ID);
    render(<AiChatPageHeader />, { wrapper: Wrapper });

    expect(screen.getByText(`Chat record header ${THREAD_ID}`)).toBeVisible();
    expect(screen.queryByText('New chat')).toBeNull();

    act(() => jotaiStore.set(currentAiChatThreadState.atom, OTHER_THREAD_ID));

    expect(
      screen.getByText(`Chat record header ${OTHER_THREAD_ID}`),
    ).toBeVisible();
  });
});
