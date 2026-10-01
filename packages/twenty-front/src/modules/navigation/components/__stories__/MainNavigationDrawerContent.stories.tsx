import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { expect, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { setAgentChatThreadPermissions } from '@/ai/testing/setAgentChatThreadPermissions';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { MainNavigationDrawerContent } from '@/navigation/components/MainNavigationDrawerContent';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const THREAD_PERMISSIONS = {
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canSoftDelete: true,
};

const THREAD = {
  __typename: 'AgentChatThread',
  id: '3a36fc8c-c8e2-4f16-a283-24dc05e3704b',
  title: 'Pipeline summary',
  deletedAt: null,
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-01T12:00:00.000Z',
};

const ContentWithCollapseControl = () => {
  const [isExpanded, setIsExpanded] = useAtomState(
    isNavigationDrawerExpandedState,
  );

  return (
    <>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      </button>
      <MainNavigationDrawerContent />
    </>
  );
};

const AiNavigationContent = () => {
  const [store] = useState(() => {
    const initialStore = createStore();
    initialStore.set(isNavigationDrawerExpandedState.atom, true);
    initialStore.set(currentUserWorkspaceState.atom, {
      permissionFlags: [PermissionFlagType.AI],
      objectsPermissions: [],
      isImpersonating: false,
      twoFactorAuthenticationMethodSummary: null,
    });
    setAgentChatThreadList(initialStore, [THREAD]);
    return initialStore;
  });

  // Persisted auth atoms must hydrate before capturing the permission snapshot.
  useEffect(() => {
    setAgentChatThreadPermissions(store, THREAD.id, THREAD_PERMISSIONS);
  }, [store]);

  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/chat']}>
        <AgentChatComponentInstanceContext.Provider
          value={{ instanceId: AGENT_CHAT_INSTANCE_ID }}
        >
          <ContentWithCollapseControl />
        </AgentChatComponentInstanceContext.Provider>
      </MemoryRouter>
    </Provider>
  );
};

const meta: Meta<typeof MainNavigationDrawerContent> = {
  title: 'Modules/Navigation/MainNavigationDrawerContent',
  component: MainNavigationDrawerContent,
  decorators: [ComponentDecorator, IconsProviderDecorator, ToastDecorator],
  parameters: { container: { width: 240, height: 400 } },
  render: () => <AiNavigationContent />,
};

export default meta;
type Story = StoryObj<typeof MainNavigationDrawerContent>;

export const KeepsAiContentWhenCollapsed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('button', { name: /Pipeline summary/ }),
    ).toBeVisible();
    const chatActions = await canvas.findByLabelText('Chat actions', {
      selector: 'button',
    });
    chatActions.focus();
    await expect(chatActions).toHaveFocus();
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Collapse sidebar' }),
    );
    await expect(
      await canvas.findByRole('button', { name: /Pipeline summary/ }),
    ).toBeVisible();
    chatActions.focus();
    await expect(chatActions).not.toHaveFocus();
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Expand sidebar' }),
    );
    await expect(
      await canvas.findByRole('button', { name: /Pipeline summary/ }),
    ).toBeVisible();
    chatActions.focus();
    await expect(chatActions).toHaveFocus();
  },
};
