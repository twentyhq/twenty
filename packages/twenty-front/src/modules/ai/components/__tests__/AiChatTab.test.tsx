import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import type * as React from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ai/hooks/useAiChatFileUpload', () => ({
  useAiChatFileUpload: () => ({ uploadFiles: jest.fn() }),
}));
jest.mock('@/activities/files/components/DropZone', () => ({
  DropZone: () => null,
}));
jest.mock('@/ai/components/AgentChatStreamingPartsDiffSyncEffect', () => ({
  AgentChatStreamingPartsDiffSyncEffect: () => null,
}));
jest.mock('@/ai/components/AiChatQueuedMessages', () => ({
  AiChatQueuedMessages: () => null,
}));
jest.mock('@/ai/components/AiChatEditorSection', () => {
  const { useContext } = jest.requireActual<typeof React>('react');
  const { AiChatMessageListPreambleContext } = jest.requireActual(
    '@/ai/contexts/AiChatMessageListPreambleContext',
  );
  return {
    AiChatEditorSection: () => (
      <textarea
        aria-label={
          useContext(AiChatMessageListPreambleContext)
            ? 'Setup message'
            : 'Message'
        }
      />
    ),
  };
});
jest.mock('@/onboarding/components/WelcomeOverlay/WelcomePersonChip', () => ({
  WelcomePersonChip: () => null,
}));
jest.mock(
  '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect',
  () => ({
    WorkspaceSetupChatKickoffEffect: () => (
      <div role="status">Starting workspace setup</div>
    ),
  }),
);
jest.mock('@/ai/components/AiChatTabMessageList', () => {
  const { useContext } = jest.requireActual<typeof React>('react');
  const { AiChatMessageListPreambleContext } = jest.requireActual(
    '@/ai/contexts/AiChatMessageListPreambleContext',
  );
  return {
    AiChatTabMessageList: () => (
      <div>{useContext(AiChatMessageListPreambleContext)}</div>
    ),
  };
});

describe.each([AI_CHAT_SURFACE.PAGE, AI_CHAT_SURFACE.SIDE_PANEL])(
  'AiChatTab on %s',
  (surface) => {
    beforeEach(() => {
      sessionStorage.clear();
      resetJotaiStore();
    });

    const renderChat = () =>
      render(
        <JotaiProvider store={jotaiStore}>
          <I18nProvider i18n={i18n}>
            <AiChatSurfaceContext.Provider value={surface}>
              <AiChatTab />
            </AiChatSurfaceContext.Provider>
          </I18nProvider>
        </JotaiProvider>,
      );

    it('shows onboarding content and removes it when setup mode ends', () => {
      jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
      renderChat();

      expect(screen.getByText('Welcome to your workspace')).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: 'Setup message' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(
        'Starting workspace setup',
      );

      act(() =>
        jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, false),
      );

      expect(
        screen.queryByText('Welcome to your workspace'),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: 'Message' }),
      ).toBeInTheDocument();
    });

    it('renders a regular conversation without starting onboarding', () => {
      renderChat();

      expect(
        screen.queryByText('Welcome to your workspace'),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: 'Message' }),
      ).toBeInTheDocument();
    });
  },
);
