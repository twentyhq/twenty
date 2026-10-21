import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Text } from 'twenty-ui/primitives/typography';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatComposerQuotePreview } from '@/ai/components/AiChatComposerQuotePreview';
import { type AiChatQuotedMessageSource } from '@/ai/types/AiChatQuotedMessageSource';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const quotedSource: AiChatQuotedMessageSource = {
  status: 'available',
  messageId: 'security-review',
  authorName: 'Marco Rossi',
  authorAvatar: (
    <Avatar name="Marco Rossi" colorSeed="marco" size="sm" shape="circle" />
  ),
  excerpt: 'Their procurement asked for a **security review**.',
};

const meta: Meta<typeof AiChatComposerQuotePreview> = {
  title: 'Modules/AI/AiChatComposerQuotePreview',
  component: AiChatComposerQuotePreview,
  decorators: [ComponentDecorator, RootDecorator],
  parameters: { container: { width: 400 } },
  args: { source: quotedSource, onRemove: fn() },
};

export default meta;
type Story = StoryObj<typeof AiChatComposerQuotePreview>;

export const SelectedQuote: Story = {};

const RemoveQuoteFixture = ({ onRemove }: { onRemove: () => void }) => {
  const [hasQuote, setHasQuote] = useState(true);

  if (!hasQuote) {
    return <Text>No quoted message</Text>;
  }

  return (
    <AiChatComposerQuotePreview
      source={quotedSource}
      onRemove={() => {
        setHasQuote(false);
        onRemove();
      }}
    />
  );
};

export const RemoveQuote: Story = {
  render: ({ onRemove }) => <RemoveQuoteFixture onRemove={onRemove} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Remove quote' }));
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText('No quoted message')).toBeVisible();
    await expect(canvas.queryByText('Marco Rossi')).not.toBeInTheDocument();
  },
};

export const UnavailableSource: Story = {
  args: { source: { status: 'unavailable' } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Original message unavailable'),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove quote' }));
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};
