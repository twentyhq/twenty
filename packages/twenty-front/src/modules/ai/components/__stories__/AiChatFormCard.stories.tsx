import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { type ReactNode, useEffect } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatFormCard } from '@/ai/components/AiChatFormCard';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';

import { styled } from '@linaria/react';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const StyledContainer = styled.div`
  max-width: 400px;
  padding: 24px;
`;

const StoreSeeder = ({ children }: { children: ReactNode }) => {
  const store = useStore();

  useEffect(() => {
    store.set(currentAiChatThreadState.atom, 'thread-1');
    store.set(agentChatDisplayedThreadState.atom, 'thread-1');
  }, [store]);

  return <>{children}</>;
};

const meta: Meta<typeof AiChatFormCard> = {
  title: 'Modules/AiChat/AiChatFormCard',
  component: AiChatFormCard,
  decorators: [
    (Story) => (
      <AgentChatComponentInstanceContext.Provider
        value={{ instanceId: 'agentChatFormCardStory' }}
      >
        <StoreSeeder>
          <StyledContainer>
            <Story />
          </StyledContainer>
        </StoreSeeder>
      </AgentChatComponentInstanceContext.Provider>
    ),
    ToastDecorator,
    ComponentDecorator,
    MemoryRouterDecorator,
    RootDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof AiChatFormCard>;

export const Default: Story = {
  args: {
    toolCallId: 'call-1',
    fields: [
      {
        name: 'amount',
        label: 'Amount (USD)',
        type: FieldMetadataType.NUMBER,
        placeholder: '50000',
      },
      {
        name: 'closeDate',
        label: 'Expected close',
        type: FieldMetadataType.DATE,
      },
      {
        name: 'nextStep',
        label: 'Next step',
        type: FieldMetadataType.TEXT,
        placeholder: 'Security review with their IT team',
      },
    ],
  },
};
