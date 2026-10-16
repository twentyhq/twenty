import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatMessageReactions } from '@/ai/components/AiChatMessageReactions';
import { agentChatMessageReactionsFamilyState } from '@/ai/states/agentChatMessageReactionsFamilyState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const mockToggleAgentChatMessageReaction = jest.fn();

jest.mock('@/ai/hooks/useToggleAgentChatMessageReaction', () => ({
  useToggleAgentChatMessageReaction: () => ({
    toggleAgentChatMessageReaction: mockToggleAgentChatMessageReaction,
  }),
}));

const MESSAGE_ID = 'message-id';
const CURRENT_MEMBER_ID = '2a7c9e1f-3b4d-4e5f-8a6b-1c2d3e4f5a6b';
const OTHER_MEMBER_ID = '9f8e7d6c-5b4a-4c3d-9e2f-1a0b9c8d7e6f';

const buildWorkspaceMember = (id: string, firstName: string) => ({
  id,
  userId: `user-${id}`,
  name: { firstName, lastName: 'Martin' },
  colorScheme: 'Light' as const,
  locale: 'en',
  userEmail: `${firstName.toLowerCase()}@example.com`,
  avatarUrl: null,
});

const renderReactions = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <AiChatMessageReactions messageId={MESSAGE_ID} />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('AiChatMessageReactions', () => {
  beforeEach(() => {
    resetJotaiStore();
    mockToggleAgentChatMessageReaction.mockClear();

    jotaiStore.set(
      currentWorkspaceMemberState.atom,
      buildWorkspaceMember(CURRENT_MEMBER_ID, 'Julia'),
    );
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      buildWorkspaceMember(CURRENT_MEMBER_ID, 'Julia'),
      buildWorkspaceMember(OTHER_MEMBER_ID, 'Tom'),
    ]);
  });

  it('shows nothing without reactions', () => {
    const { container } = renderReactions();

    expect(container).toBeEmptyDOMElement();
  });

  it('shows each emoji with who used it and marks your own', () => {
    jotaiStore.set(
      agentChatMessageReactionsFamilyState.atomFamily({
        messageId: MESSAGE_ID,
      }),
      [
        {
          emoji: '👍',
          workspaceMemberIds: [OTHER_MEMBER_ID, CURRENT_MEMBER_ID],
        },
        { emoji: '🎉', workspaceMemberIds: [OTHER_MEMBER_ID] },
      ],
    );

    renderReactions();

    expect(
      screen.getByRole('button', { name: '👍 by Tom Martin, You' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: '🎉 by Tom Martin' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles your reaction when you click an emoji', async () => {
    jotaiStore.set(
      agentChatMessageReactionsFamilyState.atomFamily({
        messageId: MESSAGE_ID,
      }),
      [{ emoji: '🎉', workspaceMemberIds: [OTHER_MEMBER_ID] }],
    );

    renderReactions();

    await userEvent.click(
      screen.getByRole('button', { name: '🎉 by Tom Martin' }),
    );

    expect(mockToggleAgentChatMessageReaction).toHaveBeenCalledWith({
      messageId: MESSAGE_ID,
      emoji: '🎉',
    });
  });
});
