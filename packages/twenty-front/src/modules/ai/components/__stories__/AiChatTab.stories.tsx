import { type Meta, type StoryObj } from '@storybook/react-vite';
import { styled } from '@linaria/react';
import { useStore } from 'jotai';
import { graphql, HttpResponse } from 'msw';
import { Suspense, useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ThemeProvider } from 'twenty-ui/theme';

import { AgentChatPrepromptEffect } from '@/ai/components/AgentChatPrepromptEffect';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { initializeNewAiChatStory } from '@/ai/testing/initializeNewAiChatStory';
import { hasRequestedWorkspaceSetupChatState } from '@/onboarding/states/hasRequestedWorkspaceSetupChatState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AiChatNewThreadPageContent } from '~/pages/ai-chat/AiChatNewThreadPageContent';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const StyledPageChat = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const NewChatStory = () => (
  <StyledPageChat>
    <Suspense fallback={null}>
      <AiChatNewThreadPageContent showInformationBanner={false} />
      <AgentChatPrepromptEffect />
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
  await expect(avatarStyle.borderRadius).toBe('50%');

  if (CSS.supports('corner-shape', 'round')) {
    await expect(['round', 'superellipse(1)']).toContain(
      avatarStyle.getPropertyValue('corner-shape'),
    );
  }

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
  decorators: [ObjectMetadataItemsDecorator],
  beforeEach: () => initializeNewAiChatStory({ isInboxEnabled: false }),
  parameters: {
    ...newChatParameters,
    container: { width: 1000, height: 784 },
  },
  render: () => <NewChatStory />,
  play: async ({ canvasElement }) => expectNewChatWelcome(canvasElement),
};

export const InboxNewChat: Story = {
  ...FullPageNewChat,
  beforeEach: () => initializeNewAiChatStory({ isInboxEnabled: true }),
  parameters: {
    ...newChatParameters,
    container: { width: 660, height: 784 },
  },
  play: async ({ canvasElement }) => {
    await expectNewChatWelcome(canvasElement);

    const canvas = within(canvasElement);
    const recipients = canvas.getByRole('group', { name: 'Recipients' });

    await userEvent.hover(within(recipients).getByText('Ada'));
    await expect(
      within(recipients).getByRole('button', { name: 'Remove Ada' }),
    ).toBeVisible();
    await userEvent.click(
      within(recipients).getByRole('button', { name: 'Remove Ada' }),
    );
    await expect(
      within(recipients).queryByRole('button', { name: 'Remove Ada' }),
    ).not.toBeInTheDocument();
    await expect(
      jotaiStore.get(
        agentChatNewThreadRecipientsFamilyState.atomFamily(
          jotaiStore.get(newAiChatThreadIdState.atom),
        ),
      ).isAssistantParticipant,
    ).toBe(false);

    await userEvent.click(
      within(recipients).getByRole('button', {
        name: 'Add people or a channel',
      }),
    );
    const popup = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Select recipients' },
    );

    await userEvent.click(within(popup).getByRole('button', { name: 'Ada' }));
    await expect(within(recipients).getByText('Ada')).toBeVisible();
    await userEvent.type(
      within(popup).getByRole('textbox', { name: 'Search recipients' }),
      'Jane',
    );
    await userEvent.click(
      within(popup).getByRole('button', { name: /Jane Doe/ }),
    );
    await expect(within(recipients).getByText('Jane Doe')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await userEvent.hover(within(recipients).getByText('Jane Doe'));
    await userEvent.click(
      within(recipients).getByRole('button', { name: 'Remove Jane Doe' }),
    );
    await expect(
      within(recipients).queryByText('Jane Doe'),
    ).not.toBeInTheDocument();
    const removeAda = within(recipients).getByRole('button', {
      name: 'Remove Ada',
    });

    removeAda.focus();
    await expect(removeAda).toBeVisible();

    await userEvent.click(
      within(recipients).getByRole('button', {
        name: 'Add people or a channel',
      }),
    );
    const pendingPopup = await within(
      canvasElement.ownerDocument.body,
    ).findByRole('dialog', { name: 'Select recipients' });
    const isSendingMessageAtom =
      agentChatIsSendingMessageFamilyState.atomFamily({
        threadId: jotaiStore.get(newAiChatThreadIdState.atom),
      });

    jotaiStore.set(isSendingMessageAtom, true);
    await waitFor(() => expect(removeAda).toBeDisabled());
    await expect(
      within(recipients).getByRole('button', {
        name: 'Add people or a channel',
      }),
    ).toBeDisabled();
    await expect(
      within(pendingPopup).getByRole('textbox', { name: 'Search recipients' }),
    ).toBeDisabled();

    for (const option of within(pendingPopup).getAllByRole('button')) {
      await expect(option).toBeDisabled();
    }

    await userEvent.hover(within(recipients).getByText('Ada'));
    await userEvent.click(removeAda);
    await expect(within(recipients).getByText('Ada')).toBeVisible();
    jotaiStore.set(isSendingMessageAtom, false);
    await waitFor(() => expect(removeAda).toBeEnabled());
    await userEvent.keyboard('{Escape}');
  },
};

export const InboxNewChatDark: Story = {
  ...InboxNewChat,
  render: () => (
    <ThemeProvider colorScheme="dark" applyToRoot={false}>
      <NewChatStory />
    </ThemeProvider>
  ),
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
        jotaiStore.get(agentChatDraftsByThreadIdState.atom)[
          jotaiStore.get(newAiChatThreadIdState.atom)
        ],
      ).toContain('A new partner'),
    );
  },
};

export const WorkspaceSetup: Story = {
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
