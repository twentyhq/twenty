import { AiChatInstanceDecorator } from '~/testing/decorators/AiChatInstanceDecorator';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatFormCard } from '@/ai-chat/tool-calls/components/AiChatFormCard';

import { styled } from '@linaria/react';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const StyledContainer = styled.div`
  max-width: 400px;
  padding: 24px;
`;

const meta: Meta<typeof AiChatFormCard> = {
  title: 'Modules/AI/AiChatFormCard',
  component: AiChatFormCard,
  parameters: { aiChatThreadId: 'thread-1' },
  decorators: [
    AiChatInstanceDecorator,
    (Story) => (
      <StyledContainer>
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

export const WithRecordField: Story = {
  parameters: { msw: graphqlMocks },
  decorators: [ObjectMetadataItemsDecorator],
  args: {
    toolCallId: 'call-2',
    fields: [
      {
        name: 'pointOfContact',
        label: 'Main point of contact',
        type: 'RECORD',
        settings: { objectName: 'person' },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('Select'));
    await userEvent.click(await body.findByText('Jeffery Griffin'));

    await waitFor(() => {
      expect(canvas.getByText('Jeffery Griffin')).toBeVisible();
    });
    expect(canvas.queryByText('Select')).not.toBeInTheDocument();
  },
};
