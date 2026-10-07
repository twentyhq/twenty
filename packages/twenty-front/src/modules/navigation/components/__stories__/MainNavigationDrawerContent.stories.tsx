import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { expect, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { MainNavigationDrawerContent } from '@/navigation/components/MainNavigationDrawerContent';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import {
  AgentChatChannelVisibility,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const CHANNEL = {
  __typename: 'AgentChatChannelListItem' as const,
  id: '3a36fc8c-c8e2-4f16-a283-24dc05e3704b',
  name: 'Sales',
  icon: null,
  color: null,
  visibility: AgentChatChannelVisibility.PUBLIC,
  isMember: true,
  canManage: true,
  memberCount: 1,
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
    setAgentChatThreadList(initialStore, []);
    initialStore.set(agentChatChannelsState.atom, [CHANNEL]);
    return initialStore;
  });

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
      await canvas.findByRole('button', { name: /Sales/ }),
    ).toBeVisible();
    const channelOptions = await canvas.findByLabelText('Channel options', {
      selector: 'button',
    });
    channelOptions.focus();
    await expect(channelOptions).toHaveFocus();
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Collapse sidebar' }),
    );
    await expect(
      await canvas.findByRole('button', { name: /Sales/ }),
    ).toBeVisible();
    channelOptions.focus();
    await expect(channelOptions).not.toHaveFocus();
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Expand sidebar' }),
    );
    await expect(
      await canvas.findByRole('button', { name: /Sales/ }),
    ).toBeVisible();
    channelOptions.focus();
    await expect(channelOptions).toHaveFocus();
  },
};
