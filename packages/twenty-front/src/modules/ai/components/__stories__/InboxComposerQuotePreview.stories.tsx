import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Text } from 'twenty-ui/primitives/typography';
import { ComponentDecorator } from 'twenty-ui/testing';

import { InboxComposerQuotePreview } from '@/ai/components/InboxComposerQuotePreview';
import { type InboxQuotedMessageSource } from '@/ai/types/InboxQuotedMessageSource';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const quotedSource: InboxQuotedMessageSource = {
  status: 'available',
  authorName: 'Marco Rossi',
  excerpt: 'On it. Their procurement asked for a security review too.',
};

const meta: Meta<typeof InboxComposerQuotePreview> = {
  title: 'Modules/AI/AiChatComposerQuotePreview',
  component: InboxComposerQuotePreview,
  decorators: [ComponentDecorator, RootDecorator],
  parameters: { container: { width: 400 } },
  args: { source: quotedSource, onRemove: fn() },
};

export default meta;
type Story = StoryObj<typeof InboxComposerQuotePreview>;

export const SelectedQuote: Story = {};

const RemoveQuoteFixture = ({ onRemove }: { onRemove: () => void }) => {
  const [hasQuote, setHasQuote] = useState(true);

  if (!hasQuote) {
    return <Text>No quoted message</Text>;
  }

  return (
    <InboxComposerQuotePreview
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
