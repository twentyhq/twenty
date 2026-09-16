import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { Suspense, useEffect, useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatTab } from '@/ai/components/AiChatTab';
import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { hasRequestedWorkspaceSetupChatState } from '@/onboarding/states/hasRequestedWorkspaceSetupChatState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

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
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: AGENT_CHAT_INSTANCE_ID }}
    >
      <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.SIDE_PANEL}>
        <Suspense fallback={null}>
          <AiChatTab />
        </Suspense>
      </AiChatSurfaceContext.Provider>
    </AgentChatComponentInstanceContext.Provider>
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
