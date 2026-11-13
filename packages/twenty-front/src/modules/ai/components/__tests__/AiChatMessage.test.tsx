import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
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

const renderMessage = ({
  messageId,
  isAiChatInboxEnabled,
  currentWorkspaceMemberId,
  error,
}: {
  messageId: string;
  isAiChatInboxEnabled: boolean;
  currentWorkspaceMemberId?: string;
  error?: Error;
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
  jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
  jotaiStore.set(
    agentChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
    [
      USER_MESSAGE,
      ASSISTANT_MESSAGE,
      NAMED_ASSISTANT_MESSAGE,
      SILENT_MESSAGE,
      MESSAGE_WITHOUT_SENDER,
    ],
  );

  return render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <AiChatMessage messageId={messageId} error={error} />
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('AiChatMessage', () => {
  beforeEach(() => {
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
});
