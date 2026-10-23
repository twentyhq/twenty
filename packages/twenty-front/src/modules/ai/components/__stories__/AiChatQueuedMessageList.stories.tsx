import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatQueuedMessageList } from '@/ai/components/AiChatQueuedMessageList';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const StyledContainer = styled.div`
  padding: ${themeCssVariables.spacing[6]};
  width: 560px;
`;

const meta = {
  title: 'Modules/AiChat/AiChatQueuedMessageList',
  component: AiChatQueuedMessageList,
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
    ComponentDecorator,
    RootDecorator,
  ],
  args: {
    messages: [
      {
        id: 'queued-1',
        isRemovable: true,
        text: 'Skip anything already in a closed-lost opportunity',
      },
      {
        id: 'queued-2',
        isRemovable: true,
        text: 'Also add the account owner for each one',
      },
      {
        id: 'queued-3',
        isRemovable: true,
        text: 'Then draft a check-in email for the top 5',
      },
    ],
    onRemove: fn(),
  },
} satisfies Meta<typeof AiChatQueuedMessageList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [messages, setMessages] = useState(args.messages);

    return (
      <AiChatQueuedMessageList
        messages={messages}
        onRemove={(messageId) => {
          args.onRemove?.(messageId);
          setMessages((previousMessages) =>
            previousMessages.filter((message) => message.id !== messageId),
          );
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const removeButtons = await canvas.findAllByRole('button', {
      name: 'Remove queued message',
    });

    await userEvent.click(removeButtons[0]);
    expect(args.onRemove).toHaveBeenCalledWith('queued-1');
    expect(
      canvas.queryByText('Skip anything already in a closed-lost opportunity'),
    ).not.toBeInTheDocument();
    expect(canvas.getByText('2')).toBeVisible();
  },
};

export const ReadOnly: Story = {
  args: { onRemove: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Queued')).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Remove queued message' }),
    ).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { messages: [] },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByText('Queued')).not.toBeInTheDocument();
  },
};

export const SharedQueue: Story = {
  args: {
    messages: [
      {
        id: 'queued-own',
        text: 'Add the account owner',
        isRemovable: true,
        sender: { id: 'member-own', name: 'You' },
      },
      {
        id: 'queued-other',
        text: 'Include the latest activity',
        isRemovable: false,
        sender: { id: 'member-other', name: 'Sarah' },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Sarah · Include the latest activity'),
    ).toBeVisible();
    expect(
      canvas.getAllByRole('button', { name: 'Remove queued message' }),
    ).toHaveLength(1);
  },
};

export const Overflow: Story = {
  args: {
    messages: [
      ...meta.args.messages,
      {
        id: 'queued-4',
        text: 'Include last quarter for comparison',
        isRemovable: true,
      },
      {
        id: 'queued-5',
        text: 'Highlight changes in deal size',
        isRemovable: true,
      },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const moreButton = await canvas.findByRole('button', { name: '2 more' });

    expect(moreButton).toHaveAttribute('aria-expanded', 'false');
    expect(
      canvas.getAllByRole('button', { name: 'Remove queued message' }),
    ).toHaveLength(3);
    expect(
      canvas.queryByText('Include last quarter for comparison'),
    ).not.toBeInTheDocument();

    await userEvent.click(moreButton);

    expect(
      canvas.getByText('Include last quarter for comparison'),
    ).toBeVisible();
    expect(canvas.getByText('Highlight changes in deal size')).toBeVisible();
    expect(
      canvas.getAllByRole('button', { name: 'Remove queued message' }),
    ).toHaveLength(5);

    const lessButton = canvas.getByRole('button', { name: 'Show less' });
    expect(lessButton).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(lessButton);

    expect(
      canvas.queryByText('Highlight changes in deal size'),
    ).not.toBeInTheDocument();
    expect(canvas.getByRole('button', { name: '2 more' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(args.onRemove).not.toHaveBeenCalled();
  },
};
