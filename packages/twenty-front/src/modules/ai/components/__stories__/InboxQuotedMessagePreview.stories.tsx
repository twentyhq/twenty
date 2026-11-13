import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { InboxQuotedMessagePreview } from '@/ai/components/InboxQuotedMessagePreview';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const meta: Meta<typeof InboxQuotedMessagePreview> = {
  title: 'Modules/AI/AiChatQuotedMessagePreview',
  component: InboxQuotedMessagePreview,
  decorators: [ComponentDecorator, RootDecorator],
  parameters: { container: { width: 400 } },
};

export default meta;
type Story = StoryObj<typeof InboxQuotedMessagePreview>;

export const Default: Story = {
  args: {
    source: {
      status: 'available',
      authorName: 'Sarah Lin',
      excerpt: 'Anthropic wants the security questionnaire back by Friday.',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Sarah Lin')).toBeVisible();
    await expect(
      canvas.getByText(
        'Anthropic wants the security questionnaire back by Friday.',
      ),
    ).toBeVisible();
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Replying to',
    source: {
      status: 'available',
      authorName: 'Marco Rossi',
      excerpt: 'On it. Their procurement asked for a security review too.',
    },
  },
};

export const UnavailableSource: Story = {
  args: { source: { status: 'unavailable' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Original message unavailable'),
    ).toBeVisible();
  },
};

export const LongQuote: Story = {
  args: {
    source: {
      status: 'available',
      authorName: 'A colleague with a longer display name',
      excerpt:
        'The procurement team asked for a security review before the renewal. Please include the latest documentation and the account owner in the next update.',
    },
  },
  parameters: { container: { width: 280 } },
};
