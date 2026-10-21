import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatQuotedMessagePreview } from '@/ai/components/AiChatQuotedMessagePreview';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const meta: Meta<typeof AiChatQuotedMessagePreview> = {
  title: 'Modules/AI/AiChatQuotedMessagePreview',
  component: AiChatQuotedMessagePreview,
  decorators: [ComponentDecorator, RootDecorator],
  parameters: { container: { width: 400 } },
  args: { onNavigateToMessage: fn() },
};

export default meta;
type Story = StoryObj<typeof AiChatQuotedMessagePreview>;

export const LinkedQuote: Story = {
  args: {
    source: {
      status: 'available',
      messageId: 'security-review',
      authorName: 'Marco Rossi',
      authorAvatar: (
        <Avatar name="Marco Rossi" colorSeed="marco" size="sm" shape="circle" />
      ),
      excerpt: 'Their procurement asked for a **security review**.',
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('security review')).toBeVisible();
    await expect(canvas.getByText('Marco Rossi')).toBeVisible();
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'View original message' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onNavigateToMessage).toHaveBeenCalledWith(
      'security-review',
    );
  },
};

export const UnavailableSource: Story = {
  args: { source: { status: 'unavailable' } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Original message unavailable'),
    ).toBeVisible();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(args.onNavigateToMessage).not.toHaveBeenCalled();
  },
};

export const LongQuote: Story = {
  args: {
    source: {
      status: 'available',
      messageId: 'long-source',
      authorName: 'A colleague with a longer display name',
      excerpt:
        'The procurement team asked for a security review before the renewal. Please include the latest documentation and the account owner in the next update.',
    },
  },
  parameters: { container: { width: 280 } },
};
