import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { AiChatComposerQuote } from '@/ai/components/AiChatComposerQuote';
import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { aiChatQuotedMessageIdFamilyState } from '@/ai/states/aiChatQuotedMessageIdFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { scrollToAiChatMessage } from '@/ai/utils/scrollToAiChatMessage';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ai/components/AiChatAssistantMessageRenderer', () => ({
  AiChatAssistantMessageRenderer: ({
    messageParts,
  }: {
    messageParts: ExtendedUIMessage['parts'];
  }) => (
    <>{messageParts.map((part) => (part.type === 'text' ? part.text : null))}</>
  ),
}));

jest.mock('@/ai/components/LazyMarkdownRenderer', () => ({
  LazyMarkdownRenderer: ({ text }: { text: string }) => <>{text}</>,
}));

jest.mock('@/ai/components/AiChatMessageReactionPicker', () => ({
  AiChatMessageReactionPicker: () => null,
}));

jest.mock('@/ai/components/AiChatMessageReactions', () => ({
  AiChatMessageReactions: () => null,
}));

jest.mock('@/ai/components/AiChatErrorRenderer', () => ({
  AiChatErrorRenderer: ({ error }: { error: Error }) => <>{error.message}</>,
}));

jest.mock('@/ui/input/components/LightCopyIconButton', () => ({
  LightCopyIconButton: () => null,
}));

jest.mock('@/ai/utils/scrollToAiChatMessage', () => ({
  scrollToAiChatMessage: jest.fn(),
}));

const THREAD_ID = '1b8e5c2a-4d3f-4a6b-9c7e-2f1d0a9b8c71';
const MEMBER_ID = '7c2d9e4f-1a3b-4c5d-8e6f-0a1b2c3d4e5f';

const USER_MESSAGE: ExtendedUIMessage = {
  id: 'user-message',
  role: 'user',
  parts: [{ type: 'text', text: 'Which deals close this week?' }],
  metadata: {
    createdAt: '2026-10-15T08:00:00.000Z',
    senderWorkspaceMemberId: MEMBER_ID,
  },
};

const ASSISTANT_MESSAGE: ExtendedUIMessage = {
  id: 'assistant-message',
  role: 'assistant',
  parts: [{ type: 'text', text: 'Five deals are in the final stage.' }],
  metadata: { createdAt: '2026-10-15T08:00:05.000Z' },
};

const NAMED_ASSISTANT_MESSAGE: ExtendedUIMessage = {
  ...ASSISTANT_MESSAGE,
  id: 'named-assistant-message',
  metadata: {
    ...ASSISTANT_MESSAGE.metadata,
    senderWorkspaceMemberId: MEMBER_ID,
  },
};

const SILENT_MESSAGE: ExtendedUIMessage = {
  id: 'silent-message',
  role: 'assistant',
  parts: [
    {
      type: 'tool-no_reply',
      toolCallId: 'call-1',
      state: 'output-available',
      input: {},
      output: { success: true },
    },
  ],
  metadata: { createdAt: '2026-10-15T08:00:10.000Z' },
};

const MESSAGE_WITHOUT_SENDER: ExtendedUIMessage = {
  id: 'message-without-sender',
  role: 'user',
  parts: [{ type: 'text', text: 'Draft the October newsletter' }],
  metadata: { createdAt: '2026-10-15T07:00:00.000Z' },
};

const REPLY_MESSAGE: ExtendedUIMessage = {
  id: 'reply-message',
  role: 'user',
  parts: [
    {
      type: 'text',
      text: '> **Julia Martin:** Which deals close this week?\n\nThe Acme renewal does.',
    },
  ],
  metadata: { createdAt: '2026-10-15T08:01:00.000Z' },
};

const REPLY_TO_MISSING_MESSAGE: ExtendedUIMessage = {
  id: 'reply-to-missing-message',
  role: 'user',
  parts: [
    {
      type: 'text',
      text: '> **Julia Martin:** Who owns Stripe?\n\nI do.',
    },
  ],
  metadata: { createdAt: '2026-10-15T08:02:00.000Z' },
};

const BUILT_IN_ASSISTANT_MESSAGE: ExtendedUIMessage = {
  id: 'built-in-assistant-message',
  role: 'assistant',
  parts: [{ type: 'text', text: 'Three deals are at risk.' }],
  metadata: { createdAt: '2026-10-15T08:03:00.000Z', isBuiltInAssistant: true },
};

const TOOL_ONLY_ASSISTANT_MESSAGE: ExtendedUIMessage = {
  id: 'tool-only-assistant-message',
  role: 'assistant',
  parts: [
    {
      type: 'tool-find_companies',
      toolCallId: 'call-2',
      state: 'output-available',
      input: {},
      output: { success: true },
    },
  ],
  metadata: { createdAt: '2026-10-15T08:04:00.000Z', isBuiltInAssistant: true },
};

const REPLY_TO_ASSISTANT_MESSAGE: ExtendedUIMessage = {
  id: 'reply-to-assistant-message',
  role: 'user',
  parts: [
    {
      type: 'text',
      text: '> **Ada:** Three deals are at risk.\n\nWhich ones?',
    },
  ],
  metadata: {
    createdAt: '2026-10-15T08:05:00.000Z',
    senderWorkspaceMemberId: MEMBER_ID,
  },
};

const renderMessage = ({
  messageId,
  isAiChatInboxEnabled,
  currentWorkspaceMemberId,
  error,
  hasComposerQuote = false,
}: {
  messageId: string;
  isAiChatInboxEnabled: boolean;
  currentWorkspaceMemberId?: string;
  error?: Error;
  hasComposerQuote?: boolean;
}) => {
  jotaiStore.set(
    currentWorkspaceMemberState.atom,
    isDefined(currentWorkspaceMemberId)
      ? { ...mockedWorkspaceMemberData, id: currentWorkspaceMemberId }
      : null,
  );
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        value: isAiChatInboxEnabled,
      },
    ],
  });
  jotaiStore.set(currentWorkspaceMembersState.atom, [
    {
      id: MEMBER_ID,
      userId: 'user-id',
      name: { firstName: 'Julia', lastName: 'Martin' },
      colorScheme: 'Light',
      locale: 'en',
      userEmail: 'julia@example.com',
      avatarUrl: null,
    },
  ]);
  jotaiStore.set(aiChatDisplayedThreadState.atom, THREAD_ID);
  jotaiStore.set(newAiChatThreadIdState.atom, THREAD_ID);
  jotaiStore.set(currentAiChatThreadState.atom, THREAD_ID);
  jotaiStore.set(
    aiChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
    [
      USER_MESSAGE,
      ASSISTANT_MESSAGE,
      NAMED_ASSISTANT_MESSAGE,
      SILENT_MESSAGE,
      MESSAGE_WITHOUT_SENDER,
      REPLY_MESSAGE,
      REPLY_TO_MISSING_MESSAGE,
      BUILT_IN_ASSISTANT_MESSAGE,
      TOOL_ONLY_ASSISTANT_MESSAGE,
      REPLY_TO_ASSISTANT_MESSAGE,
    ],
  );

  return render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <AiChatMessage messageId={messageId} error={error} />
        {hasComposerQuote && <AiChatComposerQuote />}
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('AiChatMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceMemberState.atom, null);
  });

  it('heads a member message with their name', () => {
    renderMessage({ messageId: USER_MESSAGE.id, isAiChatInboxEnabled: true });

    expect(screen.getByText('Julia Martin')).toBeInTheDocument();
    expect(
      screen.getByText('Which deals close this week?'),
    ).toBeInTheDocument();
  });

  it('shows the current member inbox message time without a sender header', () => {
    renderMessage({
      messageId: USER_MESSAGE.id,
      isAiChatInboxEnabled: true,
      currentWorkspaceMemberId: MEMBER_ID,
    });

    expect(
      screen.getByText('Which deals close this week?'),
    ).toBeInTheDocument();
    expect(screen.queryByText('You')).not.toBeInTheDocument();
    expect(screen.queryByText('Julia Martin')).not.toBeInTheDocument();
    expect(screen.getAllByText(/ago$/)).toHaveLength(1);
  });

  it('lets the current member quote their own inbox message', () => {
    renderMessage({
      messageId: USER_MESSAGE.id,
      isAiChatInboxEnabled: true,
      currentWorkspaceMemberId: MEMBER_ID,
    });

    expect(screen.getByRole('button', { name: 'Reply' })).toBeInTheDocument();
  });

  it('keeps another member name and one timestamp when signed in', () => {
    renderMessage({
      messageId: USER_MESSAGE.id,
      isAiChatInboxEnabled: true,
      currentWorkspaceMemberId: 'other-workspace-member',
    });

    expect(screen.getByText('Julia Martin')).toBeInTheDocument();
    expect(screen.getAllByText(/ago$/)).toHaveLength(1);
  });

  it('keeps the current member message time outside the inbox', () => {
    renderMessage({
      messageId: USER_MESSAGE.id,
      isAiChatInboxEnabled: false,
      currentWorkspaceMemberId: MEMBER_ID,
    });

    expect(
      screen.getByText('Which deals close this week?'),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/ago$/)).toHaveLength(1);
  });

  it('uses a neutral label when an assistant sender is not identified', () => {
    renderMessage({
      messageId: ASSISTANT_MESSAGE.id,
      isAiChatInboxEnabled: true,
    });

    expect(screen.getByText('Assistant')).toBeInTheDocument();
    expect(
      screen.getByText('Five deals are in the final stage.'),
    ).toBeInTheDocument();
  });

  it('preserves a known sender on an assistant-role message', () => {
    renderMessage({
      messageId: NAMED_ASSISTANT_MESSAGE.id,
      isAiChatInboxEnabled: true,
    });

    expect(screen.getByText('Julia Martin')).toBeInTheDocument();
    expect(screen.queryByText('Assistant')).not.toBeInTheDocument();
  });

  it('keeps the assistant unnamed without the inbox', () => {
    renderMessage({
      messageId: ASSISTANT_MESSAGE.id,
      isAiChatInboxEnabled: false,
    });

    expect(screen.queryByText('Assistant')).not.toBeInTheDocument();
  });

  it('keeps the time of a member message whose sender is unknown', () => {
    renderMessage({
      messageId: MESSAGE_WITHOUT_SENDER.id,
      isAiChatInboxEnabled: true,
    });

    expect(
      screen.getByText('Draft the October newsletter'),
    ).toBeInTheDocument();
    expect(screen.getByText('Unknown sender')).toBeInTheDocument();
    expect(screen.getByText(/ago$/)).toBeInTheDocument();
  });

  it('hides a reply Ada chose not to send', () => {
    const { container } = renderMessage({
      messageId: SILENT_MESSAGE.id,
      isAiChatInboxEnabled: true,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('still shows an error raised after Ada chose not to reply', () => {
    renderMessage({
      messageId: SILENT_MESSAGE.id,
      isAiChatInboxEnabled: true,
      error: new Error('The connection to the assistant was lost'),
    });

    expect(
      screen.getByText('The connection to the assistant was lost'),
    ).toBeInTheDocument();
  });

  it('opens the original message from the quote a reply starts with', async () => {
    renderMessage({ messageId: REPLY_MESSAGE.id, isAiChatInboxEnabled: true });

    expect(screen.getByText('The Acme renewal does.')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'View original message' }),
    );

    expect(scrollToAiChatMessage).toHaveBeenCalledWith(USER_MESSAGE.id);
  });

  it('names the current member "You" when a reply quotes their own message', () => {
    renderMessage({
      messageId: REPLY_MESSAGE.id,
      isAiChatInboxEnabled: true,
      currentWorkspaceMemberId: MEMBER_ID,
    });

    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.queryByText('Julia Martin')).not.toBeInTheDocument();
  });

  it('shows "Replying to You" when the composer quotes an own message', async () => {
    renderMessage({
      messageId: USER_MESSAGE.id,
      isAiChatInboxEnabled: true,
      currentWorkspaceMemberId: MEMBER_ID,
      hasComposerQuote: true,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Reply' }));

    expect(screen.getByText('Replying to')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('hides the reply bar while switching to another chat', async () => {
    renderMessage({
      messageId: USER_MESSAGE.id,
      isAiChatInboxEnabled: true,
      currentWorkspaceMemberId: MEMBER_ID,
      hasComposerQuote: true,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Reply' }));
    expect(screen.getByText('Replying to')).toBeInTheDocument();

    act(() => {
      jotaiStore.set(currentAiChatThreadState.atom, 'another-thread');
      jotaiStore.set(
        aiChatQuotedMessageIdFamilyState.atomFamily({
          threadId: 'another-thread',
        }),
        USER_MESSAGE.id,
      );
    });

    expect(screen.queryByText('Replying to')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Original message unavailable'),
    ).not.toBeInTheDocument();
  });

  it('opens the original message from the keyboard', async () => {
    renderMessage({ messageId: REPLY_MESSAGE.id, isAiChatInboxEnabled: true });

    screen.getByRole('button', { name: 'View original message' }).focus();
    await userEvent.keyboard('{Enter}');

    expect(scrollToAiChatMessage).toHaveBeenCalledWith(USER_MESSAGE.id);
  });

  it('shows a quote whose original is missing without a way to open it', () => {
    renderMessage({
      messageId: REPLY_TO_MISSING_MESSAGE.id,
      isAiChatInboxEnabled: true,
    });

    expect(screen.getByText('Who owns Stripe?')).toBeInTheDocument();
    expect(screen.getByText('I do.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'View original message' }),
    ).not.toBeInTheDocument();
  });

  it('leaves a quote-shaped message as written outside the inbox', () => {
    renderMessage({ messageId: REPLY_MESSAGE.id, isAiChatInboxEnabled: false });

    expect(
      screen.getByText(/\*\*Julia Martin:\*\* Which deals close this week\?/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'View original message' }),
    ).not.toBeInTheDocument();
  });

  it('lets a member quote the assistant by its name', async () => {
    renderMessage({
      messageId: BUILT_IN_ASSISTANT_MESSAGE.id,
      isAiChatInboxEnabled: true,
      currentWorkspaceMemberId: MEMBER_ID,
      hasComposerQuote: true,
    });

    expect(screen.getAllByText('Ada')).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'Reply' }));

    expect(screen.getAllByText('Ada')).toHaveLength(2);
    expect(screen.getAllByText('Three deals are at risk.')).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: 'Remove quote' }),
    ).toBeInTheDocument();
  });

  it('lets a member quote an assistant turn without text', async () => {
    renderMessage({
      messageId: TOOL_ONLY_ASSISTANT_MESSAGE.id,
      isAiChatInboxEnabled: true,
      currentWorkspaceMemberId: MEMBER_ID,
      hasComposerQuote: true,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Reply' }));

    expect(screen.getAllByText('Ada')).toHaveLength(2);
    expect(screen.getByText('No text content')).toBeInTheDocument();
  });

  it('opens the assistant message a reply quotes', async () => {
    renderMessage({
      messageId: REPLY_TO_ASSISTANT_MESSAGE.id,
      isAiChatInboxEnabled: true,
    });

    expect(screen.getByText('Which ones?')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'View original message' }),
    );

    expect(scrollToAiChatMessage).toHaveBeenCalledWith(
      BUILT_IN_ASSISTANT_MESSAGE.id,
    );
  });
});
