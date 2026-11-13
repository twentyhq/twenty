import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatFormCard } from '@/ai/components/AiChatFormCard';
import { inboxDisplayedThreadState } from '@/ai/states/inboxDisplayedThreadState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';

import { styled } from '@linaria/react';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const StyledContainer = styled.div`
  max-width: 400px;
  padding: 24px;
`;

const StoreSeederEffect = () => {
  const store = useStore();

  useEffect(() => {
    store.set(currentInboxThreadState.atom, 'thread-1');
    store.set(inboxDisplayedThreadState.atom, 'thread-1');
  }, [store]);

  return null;
};

const meta: Meta<typeof AiChatFormCard> = {
  title: 'Modules/AiChat/AiChatFormCard',
  component: AiChatFormCard,
  decorators: [
    (Story) => (
      <StyledContainer>
        <StoreSeederEffect />
        <Story />
      </StyledContainer>
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
