import { AiChatInstanceDecorator } from '~/testing/decorators/AiChatInstanceDecorator';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { styled } from '@linaria/react';
import { useStore } from 'jotai';
import { graphql, HttpResponse } from 'msw';
import { Suspense, useEffect, useState } from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ThemeProvider } from 'twenty-ui/theme';

import { AiChatTab } from '@/ai-chat/instance/components/AiChatTab';
import { AI_CHAT_NEW_THREAD_RECIPIENT_SUGGESTIONS_PAGE_SIZE } from '@/ai-chat/composer/constants/AiChatNewThreadRecipientSuggestionsPageSize';
import { AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/states/composer/aiChatComposerNewThreadRecipientsFamilyState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';
import { initializeNewAiChatStory } from '@/inbox/testing/initializeNewAiChatStory';
import { hasRequestedWorkspaceSetupChatState } from '@/onboarding/states/hasRequestedWorkspaceSetupChatState';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AiChatNewThreadPageContent } from '@/ai-chat/instance/components/AiChatNewThreadPageContent';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ChatObjectMetadataDecorator } from '~/testing/decorators/ChatObjectMetadataDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

const StyledPageChat = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const NewChatStory = () => (
  <StyledPageChat>
    <Suspense fallback={null}>
      <AiChatNewThreadPageContent showInformationBanner={false} />
    </Suspense>
  </StyledPageChat>
);

const WorkspaceSetupChatStory = () => {
  const store = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    store.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    store.set(hasRequestedWorkspaceSetupChatState.atom, true);
    setIsReady(true);

    return () => {
      store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
      store.set(hasRequestedWorkspaceSetupChatState.atom, false);
    };
  }, [store]);

  return isReady ? (
    <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.SIDE_PANEL}>
      <Suspense fallback={null}>
        <AiChatTab />
      </Suspense>
    </AiChatSurfaceContext.Provider>
  ) : null;
};

const meta = {
  title: 'Modules/AI/AiChatTab',
  component: AiChatTab,
  decorators: [
    AiChatInstanceDecorator,
    ComponentDecorator,
    RootDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
  ],
  parameters: { container: { width: 480, height: 700 } },
} satisfies Meta<typeof AiChatTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const newChatParameters = {
  msw: {
    handlers: [
      graphql.query('GetAiChatUsage', () =>
        HttpResponse.json({ data: { aiChatUsage: null } }),
      ),
    ],
  },
};

const expectNewChatWelcome = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const heading = await canvas.findByRole('heading', {
    name: 'How can I help you?',
  });

  await expect(heading).toBeVisible();

  const avatar = heading.previousElementSibling;

  assertIsDefinedOrThrow(avatar);

  const avatarStyle = getComputedStyle(avatar);

  await expect(avatarStyle.width).toBe(avatarStyle.height);

  await expect(
    canvas.getByRole('button', { name: 'Create a workflow' }),
  ).toBeVisible();
  await expect(
    canvas.getByRole('button', { name: 'Create a record' }),
  ).toBeVisible();
  await expect(
    canvas.getByRole('button', { name: 'See what I can do' }),
  ).toBeVisible();
  await expect(canvas.getByRole('textbox')).toBeVisible();
  await expect(
    canvas.getByRole('button', { name: 'Send message' }),
  ).toBeDisabled();
};

export const FullPageNewChat: Story = {
  decorators: [ChatObjectMetadataDecorator, ObjectMetadataItemsDecorator],
  beforeEach: () => initializeNewAiChatStory({ isInboxEnabled: false }),
  parameters: {
    ...newChatParameters,
    container: { width: 1000, height: 784 },
  },
  render: () => <NewChatStory />,
  play: async ({ canvasElement }) => expectNewChatWelcome(canvasElement),
};

const focusRecipientRemoval = async ({
  recipients,
  label,
}: {
  recipients: HTMLElement;
  label: string;
}) => {
  const recipientRemoval = within(recipients).getByRole('button', {
    name: `Remove ${label}`,
  });

  recipientRemoval.focus();
  await expect(recipientRemoval).toBeVisible();

  return recipientRemoval;
};

export const InboxNewChat: Story = {
  ...FullPageNewChat,
  beforeEach: () => {
    initializeNewAiChatStory({ isInboxEnabled: true });
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      ...jotaiStore.get(currentWorkspaceMembersState.atom),
      ...Array.from(
        { length: AI_CHAT_NEW_THREAD_RECIPIENT_SUGGESTIONS_PAGE_SIZE + 10 },
        (_, index) => ({
          ...mockedWorkspaceMemberData,
          id: `20202020-7c1e-4a0f-9d2b-${String(index).padStart(12, '0')}`,
          name: { firstName: 'Teammate', lastName: String(index + 1) },
          userEmail: `teammate${index + 1}@example.com`,
        }),
      ),
    ]);
  },
  parameters: {
    ...newChatParameters,
    container: { width: 660, height: 784 },
  },
  play: async ({ canvasElement }) => {
    await expectNewChatWelcome(canvasElement);

    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const recipients = canvas.getByRole('group', { name: 'Recipients' });
    const addRecipients = within(recipients).getByRole('combobox', {
      name: 'Add people or a channel',
    });

    await userEvent.click(
      await focusRecipientRemoval({ recipients, label: 'Ada' }),
    );
    await expect(
      within(recipients).queryByRole('button', { name: 'Remove Ada' }),
    ).not.toBeInTheDocument();
    await expect(
      jotaiStore.get(
        aiChatComposerNewThreadRecipientsFamilyState.atomFamily(
          jotaiStore.get(newAiChatThreadIdState.atom),
        ),
      ).isAssistantParticipant,
    ).toBe(false);
    await expect(addRecipients).toHaveFocus();

    await userEvent.click(addRecipients);
    const suggestionList = await body.findByRole('listbox', {
      name: 'Select recipients',
    });

    await expect(within(suggestionList).getAllByRole('option')).toHaveLength(
      AI_CHAT_NEW_THREAD_RECIPIENT_SUGGESTIONS_PAGE_SIZE,
    );
    fireEvent.scroll(suggestionList, {
      target: { scrollTop: suggestionList.scrollHeight },
    });
    await waitFor(() =>
      expect(
        within(suggestionList).getAllByRole('option').length,
      ).toBeGreaterThan(AI_CHAT_NEW_THREAD_RECIPIENT_SUGGESTIONS_PAGE_SIZE),
    );
    await userEvent.type(addRecipients, 'Jane');
    const janeOption = await body.findByRole('option', { name: /Jane Doe/ });

    await expect(
      body.queryByRole('option', { name: 'Ada' }),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(janeOption).toHaveAttribute('data-highlighted'));
    await userEvent.keyboard('{Enter}');
    await expect(within(recipients).getByText('Jane Doe')).toBeVisible();
    await expect(addRecipients).toHaveValue('');
    await expect(addRecipients).toHaveFocus();
    await userEvent.click(addRecipients);
    await userEvent.click(await body.findByRole('option', { name: 'Ada' }));
    await expect(within(recipients).getByText('Ada')).toBeVisible();
    await userEvent.type(addRecipients, 'Nobody');
    await waitFor(() =>
      expect(body.getByText('No recipients found')).toBeVisible(),
    );
    await userEvent.clear(addRecipients);
    await waitFor(() =>
      expect(body.getAllByRole('option')).toHaveLength(
        AI_CHAT_NEW_THREAD_RECIPIENT_SUGGESTIONS_PAGE_SIZE,
      ),
    );
    await userEvent.keyboard('{Escape}');
    await userEvent.click(
      await focusRecipientRemoval({ recipients, label: 'Jane Doe' }),
    );
    await expect(
      within(recipients).queryByText('Jane Doe'),
    ).not.toBeInTheDocument();
    await expect(addRecipients).toHaveValue('');
    const isSendingMessageAtom =
      aiChatThreadReplyIsSendingFamilyState.atomFamily({
        threadId: jotaiStore.get(newAiChatThreadIdState.atom),
      });

    jotaiStore.set(isSendingMessageAtom, true);
    await waitFor(() =>
      expect(
        canvas.queryByRole('group', { name: 'Recipients' }),
      ).not.toBeInTheDocument(),
    );

    jotaiStore.set(isSendingMessageAtom, false);
    await focusRecipientRemoval({
      recipients: await canvas.findByRole('group', { name: 'Recipients' }),
      label: 'Ada',
    });
  },
};

export const InboxNewChatDark: Story = {
  ...InboxNewChat,
  render: () => (
    <ThemeProvider colorScheme="dark" applyToRoot={false}>
      <NewChatStory />
    </ThemeProvider>
  ),
  play: FullPageNewChat.play,
};

export const NewChatSuggestedPrompt: Story = {
  ...FullPageNewChat,
  play: async ({ canvasElement }) => {
    await expectNewChatWelcome(canvasElement);

    const canvas = within(canvasElement);
    const editor = canvas.getByRole('textbox');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Create a record' }),
    );
    await waitFor(() => expect(editor).toHaveTextContent('Details:'));
    await waitFor(() => expect(editor).toHaveFocus());
    await userEvent.type(editor, 'A new partner');
    await expect(editor).toHaveTextContent('A new partner');
    await expect(
      canvas.getByRole('button', { name: 'Send message' }),
    ).toBeEnabled();

    await waitFor(() =>
      expect(
        jotaiStore.get(aiChatComposerDraftsState.atom)[
          jotaiStore.get(newAiChatThreadIdState.atom)
        ],
      ).toContain('A new partner'),
    );
  },
};

export const WorkspaceSetup: Story = {
  decorators: [ChatObjectMetadataDecorator, ObjectMetadataItemsDecorator],
  render: () => <WorkspaceSetupChatStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Welcome to your workspace'),
    ).toBeVisible();
    await expect(canvas.getByRole('textbox')).toBeVisible();
  },
};

export const WorkspaceSetupCompletion: Story = {
  decorators: [ChatObjectMetadataDecorator, ObjectMetadataItemsDecorator],
  render: () => <WorkspaceSetupChatStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Welcome to your workspace'),
    ).toBeVisible();
    await expect(canvas.getByRole('textbox')).toBeVisible();

    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, false);

    await waitFor(() =>
      expect(
        canvas.queryByText('Welcome to your workspace'),
      ).not.toBeInTheDocument(),
    );
    await expect(canvas.getByRole('textbox')).toBeVisible();
  },
};

const initializeInboxChatWithTeammate = (
  getMessages: (teammateId: string | undefined) => ExtendedUIMessage[],
) => {
  initializeNewAiChatStory({ isInboxEnabled: true });

  const threadId = jotaiStore.get(newAiChatThreadIdState.atom);
  const teammate = jotaiStore
    .get(currentWorkspaceMembersState.atom)
    .find(({ name }) => name.firstName === 'Jane');

  jotaiStore.set(
    aiChatThreadDisplayedMessagesFamilyState.atomFamily({ threadId }),
    getMessages(teammate?.id),
  );
};

export const ReplyToTeammate: Story = {
  ...FullPageNewChat,
  beforeEach: () => {
    initializeInboxChatWithTeammate((teammateId) => [
      {
        id: '20202020-7c1e-4a0f-9d2b-3f4e5a6b7c91',
        role: 'user',
        parts: [
          {
            type: 'text',
            text: 'On it. Their procurement asked for a security review.',
          },
        ],
        metadata: { senderWorkspaceMemberId: teammateId },
      },
    ]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reply = await canvas.findByRole('button', { name: 'Reply' });

    reply.focus();
    await userEvent.click(reply);
    await expect(await canvas.findByText('Replying to')).toBeVisible();
    await waitFor(() => expect(canvas.getByRole('textbox')).toHaveFocus());

    await userEvent.click(canvas.getByRole('button', { name: 'Remove quote' }));
    await expect(canvas.queryByText('Replying to')).not.toBeInTheDocument();
  },
};

export const OpenOriginalFromReply: Story = {
  ...FullPageNewChat,
  beforeEach: () => {
    initializeInboxChatWithTeammate((teammateId) => [
      {
        id: '20202020-7c1e-4a0f-9d2b-3f4e5a6b7c91',
        role: 'user',
        parts: [
          {
            type: 'text',
            text: 'On it. Their procurement asked for a security review.',
          },
        ],
        metadata: { senderWorkspaceMemberId: teammateId },
      },
      {
        id: '20202020-8d2f-4b1a-8e3c-4a5b6c7d8e92',
        role: 'user',
        parts: [
          {
            type: 'text',
            text: '> **Jane Doe:** On it. Their procurement asked for a security review.\n\nThanks, I will loop in our security lead.',
          },
        ],
        metadata: { senderWorkspaceMemberId: teammateId },
      },
    ]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const quote = await canvas.findByRole('button', {
      name: 'View original message',
    });

    await userEvent.click(quote);
    await expect(
      await canvas.findByText('Thanks, I will loop in our security lead.'),
    ).toBeVisible();
  },
};
